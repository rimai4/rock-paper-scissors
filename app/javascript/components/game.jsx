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
  const [full, setFull] = useState(false);
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
      setFull(data.full);
    },
    PLAYER_LEFT() {
      setFull(false);
    },
    PLAYER1_CHOICE(data) {
      setPlayer1Choice(data.choice);
    },
    PLAYER2_CHOICE(data) {
      setPlayer2Choice(data.choice);
    },
    GAME_FINISHED(data) {
      setOpponentChoice(data.player1 === playerId ? data.player2_choice : data.player1_choice);
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

  useEffect(() => {
    if (choice && opponentChoice) {
      const result = getResult(choice, opponentChoice);
      if (result === 'win') {
        setWins((wins) => wins + 1);
      } else if (result === 'loss') {
        setLosses((losses) => losses + 1);
      }
      setTimeout(startCountdown, 2000);
    }
  }, [opponentChoice]);

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

  if (!full) {
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
