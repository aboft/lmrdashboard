import UserList from "../components/UserList";
import { Container, Row, Col } from "reactstrap";
import MessageList from "./MessageList";
import LineCountList from "./LineCountList";
import TopWords from "./TopWords";
import DuccKillersStatsList from "./DuccKillerStatsList";
import DuccFriendStatsList from "./DuccFriendStatsList";

export default function Dashboard() {
  return (
    <div className={"dashboard-container"}>
      <Container>
        <Row>
          <Col md>
            <DuccFriendStatsList />
          </Col>
          <Col md>
            <DuccKillersStatsList />
          </Col>
        </Row>
        <Row>
          <Col md>
            <UserList />
          </Col>
          <Col md>
            <LineCountList />
          </Col>
        </Row>
        <Row>
          <Col md>
            <MessageList />
          </Col>
          <Col md>
            <TopWords />
          </Col>
        </Row>
      </Container>
    </div>
  );
}
