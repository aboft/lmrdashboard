import { useEffect, useRef, useState } from 'react';
import { InputGroup, InputGroupAddon, Input, Button } from 'reactstrap';
import { getEventSourceBaseUrl } from '../data/EventSource';
import { FaSearch } from 'react-icons/fa';
import { getNickCSSClass } from '../data/UserHash';

export default function FightRelationPicker(): JSX.Element {
  const [nick1, setNick1] = useState<string>('');
  const [nick2, setNick2] = useState<string>('');
  const [nick1Wins, setNick1Wins] = useState<number>(-1);
  const [nick2Wins, setNick2Wins] = useState<number>(-1);
  const [displayError, setDisplayError] = useState<boolean>(false);
  const [resultsAvailable, setResultsAvailable] = useState<boolean>(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResultsAvailable(false);
  }, [nick1, nick2]);

  const handleSearchRequest = (): void => {
    if (nick1.length === 0 || nick2.length === 0) {
      return;
    }

    fetch(getEventSourceBaseUrl() + `/fightRelation?nick1=${nick1}&nick2=${nick2}`)
      .then((response) => {
        if (response.ok) {
          setDisplayError(false);
          return response.json();
        } else {
          const msg = response.statusText;
          throw new Error('Failed to get fightRelation. ' + msg);
        }
      })
      .then((data) => {
        setNick1Wins(data.nick1Wins);
        setNick2Wins(data.nick2Wins);
        setResultsAvailable(true);
      })
      .catch((e) => {
        console.error(e);
        setResultsAvailable(false);
        setDisplayError(true);
        setTimeout(() => {
          setDisplayError(false);
        }, 10_000);
      });
  };

  return (
    <div className={'fight-relation-picker-container'}>
      <InputGroup>
        <Input
          className={'input-nick1'}
          placeholder={'Nick 1'}
          onChange={(x) => {
            setNick1(x.target.value);
          }}
          onKeyDown={(x) => {
            if (x.key === 'Enter') {
              (buttonRef.current?.children[0] as HTMLButtonElement).click();
            }
          }}
        />
        <Input
          className={'input-nick2'}
          placeholder={'Nick 2'}
          onChange={(x) => {
            setNick2(x.target.value);
          }}
          onKeyDown={(x) => {
            if (x.key === 'Enter') {
              (buttonRef.current?.children[0] as HTMLButtonElement).click();
            }
          }}
        />
        <InputGroupAddon addonType="append">
          <div ref={buttonRef}>
            <Button onClick={handleSearchRequest}>
            <FaSearch />
            </Button>
          </div>
        </InputGroupAddon>
      </InputGroup>
      {displayError && <div className={'fight-relation-error'}>No match found.</div>}
      {resultsAvailable && (
        <div className={'fight-relation-results'}>
          <div>
            {/*TODO: Move these replaces into the getNickCSSClass function itself*/}
            <span className={getNickCSSClass(nick1)}>{nick1}'s</span> wins vs{' '}
            <span className={getNickCSSClass(nick2)}>{nick2}</span>: <b>{nick1Wins}</b>
          </div>
          <div>
            <span className={getNickCSSClass(nick2)}>{nick2}'s</span> wins vs{' '}
            <span className={getNickCSSClass(nick1)}>{nick1}</span>: <b>{nick2Wins}</b>
          </div>
        </div>
      )}
    </div>
  );
}
