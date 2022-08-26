import React, { useEffect, useState } from 'react';
import { useRestartCountdown } from '../hooks/use_restart';

const ICONS = {
  rock: {
    class: 'fa-hand-rock',
    t: 'Steen',
  },
  paper: {
    class: 'fa-hand',
    t: 'Papier',
  },
  scissors: {
    class: 'fa-hand-scissors',
    t: 'Schaar',
  },
};

function getResult(choice, opponentChoice) {
  if (choice === opponentChoice) {
    return 'draw';
  }
  if (
    [
      choice === 'rock' && opponentChoice === 'scissors',
      choice === 'paper' && opponentChoice === 'rock',
      choice === 'scissors' && opponentChoice === 'paper',
    ].some((x) => x)
  ) {
    return 'win';
  }
  return 'loss';
}

function getResultClasses(result) {
  switch (result) {
    case 'win':
      return ['win', 'loss'];
    case 'loss':
      return ['loss', 'win'];
    default:
      return ['mr-5', ''];
  }
}

function getResultText(result) {
  switch (result) {
    case 'win':
      return 'Jij wint!';
    case 'loss':
      return 'Je tegenstander wint!';
    default:
      return 'Gelijkspel!';
  }
}

function Icon({ icon, onClick, resultClass = '' }) {
  const data = ICONS[icon];
  const className = `fa-regular h-100 w-100 game-icon mb-3 ${data.class} ${resultClass}`;

  return (
    <div onClick={() => onClick?.()} className="image icon-container mx-3">
      <i className={className}></i>
      <div className="has-text-centered">{data.t}</div>
    </div>
  );
}

const Game = ({ channel, playerId }) => {
  const [copyButtonText, setCopyButtonText] = useState('Kopieer link');
  const [player1, setPlayer1] = useState(undefined);
  const [player2, setPlayer2] = useState(undefined);
  const [choice, setChoice] = useState(undefined);
  const [opponentChoice, setOpponentChoice] = useState(undefined);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const { secondsLeft, startCountdown } = useRestartCountdown(channel);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopyButtonText('Gekopieerd!');
    setTimeout(() => {
      setCopyButtonText('Kopieer link');
    }, 500);
  }

  const handlers = {
    PLAYER_JOINED(data) {
      setPlayer1(data.player1);
      setPlayer2(data.player2);
      const isPlayer1 = data.player1 === playerId;
      setWins(isPlayer1 ? data.player1_wins : data.player2_wins);
      setLosses(isPlayer1 ? data.player2_wins : data.player1_wins);
    },
    PLAYER_LEFT(data) {
      setPlayer1(data.player1);
      setPlayer2(data.player2);
    },
    GAME_FINISHED(data) {
      const isPlayer1 = data.player1 === playerId;
      setOpponentChoice(isPlayer1 ? data.player2_choice : data.player1_choice);
      setWins(isPlayer1 ? data.player1_wins : data.player2_wins);
      setLosses(isPlayer1 ? data.player2_wins : data.player1_wins);
      setTimeout(startCountdown, 2000);
    },
    RESTART() {
      setChoice(undefined);
      setOpponentChoice(undefined);
    },
  };

  useEffect(() => {
    channel.received = (data) => {
      console.log('received data', data);
      const handler = handlers[data.event];
      handler?.(data);
    };
  }, []);

  function choose(choice) {
    setChoice(choice);
    channel.perform('choose', { choice });
  }

  function Card({ children }) {
    return (
      <div className="columns is-centered">
        <div className="column is-6">
          <div className="is-flex is-justify-content-center mb-3">
            <h3 className="title is-3">
              {wins} - {losses}
            </h3>
          </div>

          <div className="card game-window">
            <div className="card-content h-100">{children}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!player1 || !player2) {
    return (
      <>
        <div className="columns is-centered">
          <div className="column is-6">
            <div className="field has-addons">
              <button onClick={copyLink} className="button">
                <span className="icon is-small">
                  <i className="fa-regular fa-copy"></i>
                </span>
                <span>{copyButtonText}</span>
              </button>
            </div>
          </div>
        </div>

        <Card>
          <div className="is-flex is-flex-direction-column is-justify-content-space-between is-align-items-center h-100">
            <h5 className="title is-5 has-text-centered">Wachten op je tegenstander....</h5>
            <img src="/loading.gif" />
          </div>
        </Card>
      </>
    );
  }

  if (!choice) {
    return (
      <Card>
        <div className="is-flex is-justify-content-space-between is-align-items-center h-100">
          <Icon icon="rock" resultClass="choice-icon" onClick={() => choose('rock')} />
          <Icon icon="paper" resultClass="choice-icon" onClick={() => choose('paper')} />
          <Icon icon="scissors" resultClass="choice-icon" onClick={() => choose('scissors')} />
        </div>
      </Card>
    );
  }

  if (choice && !opponentChoice) {
    return (
      <Card>
        <div className="is-flex is-justify-content-center is-align-items-center h-100">
          <Icon icon={choice} />
        </div>
      </Card>
    );
  }

  const result = getResult(choice, opponentChoice);
  const [resultClass, opponentResultClass] = getResultClasses(result);
  const resultText = getResultText(result);

  return (
    <Card>
      <div className="is-flex is-flex-direction-column is-justify-content-space-between is-align-items-center h-100">
        <div className="has-text-centered result">
          <h5 className="title is-5">{resultText}</h5>
        </div>

        <div className="is-flex">
          <Icon icon={choice} resultClass={resultClass} />
          <Icon icon={opponentChoice} resultClass={opponentResultClass} />
        </div>

        <div className="result has-text-centered">
          {secondsLeft && (
            <p className="subtitle">
              Volgende potje start in <strong>{secondsLeft}</strong>
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Game;
