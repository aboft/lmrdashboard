export default function TopWord(props: ITopWord) {
  return (
    <div className={'topword-wrapper'}>
      <div className={'topword-word'} title={props.word}>{props.word}</div>
      <div className={'topword-separator'}>:</div>
      <div className={'topword-count'}>{props.count}</div>
    </div>
  );
}

export interface ITopWord {
  word: string;
  count: number;
}
