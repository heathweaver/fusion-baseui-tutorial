// @flow 
import * as React from "react";
import { format } from "date-fns";

// Base UI components
import { Card } from "baseui/card";
import { Block } from "baseui/block";
import { HeaderNavigation } from "baseui/header-navigation";
import { StatefulInput } from "baseui/input";
import { Notification, KIND } from "baseui/notification";
import Search from "./search";

// redux and fusion helpers
import { compose } from "redux";
import { connect } from "react-redux";
import { prepared } from "fusion-react";
import { withRPCRedux } from "fusion-plugin-rpc-redux-react";

// types
import type { ConcertT } from "../redux/concerts";

class Home extends React.Component<
  {
    getConcerts: () => void,
    concerts: { data: ConcertT[], error: ?string }
  },
  { search: string }
>  {
  state = {
    search: ""
  };

  render() {
    const { concerts } = this.props;
    if (concerts.error) {
      return (
        <Block display="flex" justifyContent="center">
          <Notification kind={KIND.negative}>{concerts.error}</Notification>
        </Block>
      );
    }
    return (
      <React.Fragment>
        <HeaderNavigation>
          <StatefulInput
            overrides={{ After: Search }}
            placeholder="Concerts in Iceland"
            onChange={e => this.setState({ search: e.target.value })}
          />
        </HeaderNavigation>
        <Block
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))"
          justifyItems="center"
          gridGap="scale1000"
          margin="scale1000"
        >
          {concerts.data &&
            concerts.data
            .filter(concert => 
              concert.name
              .toLocaleLowerCase()
              .includes(this.state.search.toLocaleLowerCase())
            )
            .map(concert => (
            <Card
              headerImage={concert.imageSource}
              title={concert.name}
              key={concert.eventDateName + concert.dateOfShow}
              overrides={{
                Root: {
                  style: { maxWidth: "280px", justifySelf: "center" }
                }
              }}
            >
              📅 {format(concert.dateOfShow, "DD/MM/YYYY hh:mm A")}
              <br />
              📍 {concert.eventHallName}
            </Card>
          ))}
        </Block>
      </React.Fragment>
    );
  }
}

const hoc = compose(
  // generates Redux actions and
  // a React prop for the `getConcerts` RPC call
  withRPCRedux("getConcerts"),
  // expose the Redux state to React props
  connect(({ concerts }) => ({ concerts })),
  // invokes the passed in method on component hydration
  prepared(props => {
    if (props.concerts.loading || props.concerts.data.length) {
      return Promise.resolve();
    }
    return props.getConcerts();
  })
);

export default hoc(Home);
