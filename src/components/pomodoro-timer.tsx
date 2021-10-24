import React, { useEffect, useState, useCallback } from 'react';
import { useInterval } from '../hooks/use-interval';
import { secondsToMinutes } from '../utils/seconds-to-minutes';
import { secondsToTime } from '../utils/seconds-to-time';
import { Button } from './button';
import { Timer } from './timer';

const audioStartWorking = new Audio('/sounds/bell-start.mp3');
const audioStopWorking = new Audio('/sounds/bell-finish.mp3');

interface Props {
  pomodoroTimer: number;
  shortRestTime: number;
  longRestTime: number;
  cycles: number;
}

export function PomodoroTimer(props: Props): JSX.Element {
  const [mainTime, setMainTime] = React.useState(props.pomodoroTimer);
  const [timeCounting, setTimeCounting] = React.useState(false);
  const [working, setWorking] = React.useState(false);
  const [resting, setResting] = React.useState(false);
  const [cyclesQTDManager, setCyclesQTDManager] = React.useState(
    new Array(props.cycles - 1),
  );
  const [completedCycles, setCompletedCycles] = useState(0);
  const [fullWorkingTime, setFullWorkingTime] = useState(0);
  const [numberOfPomodoros, setNumberOfPomodoros] = useState(0);

  useInterval(
    () => {
      setMainTime(mainTime - 1);
      if (working) setFullWorkingTime(fullWorkingTime + 1);
    },
    timeCounting ? 1000 : null,
  );
  //   return <div>Olá mundo: {secondsToTime(mainTime)} </div>;
  function configureWork() {
    setTimeCounting(true);
    setWorking(true);
    setResting(false);
    setMainTime(props.pomodoroTimer);
    audioStartWorking.play();
  }
  function configureRest(long: boolean) {
    setTimeCounting(true);
    setWorking(false);
    setResting(true);

    if (long) {
      setMainTime(props.longRestTime);
    } else {
      setMainTime(props.shortRestTime);
    }
    audioStopWorking.play();
  }

  useEffect(() => {
    if (working) {
      document.body.classList.add('working');
    }
    if (resting) {
      document.body.classList.remove('working');
    }

    if (mainTime > 0) return;

    if (working && cyclesQTDManager.length > 0) {
      configureRest(false);
      cyclesQTDManager.pop();
    } else if (working && cyclesQTDManager.length <= 0) {
      configureRest(true);
      setCyclesQTDManager(new Array(props.cycles - 1).fill(true));
      setCompletedCycles(completedCycles + 1);
    }

    if (working) {
      setNumberOfPomodoros(numberOfPomodoros + 1);
    }
    if (resting) configureWork();
  }, [
    working,
    resting,
    mainTime,
    cyclesQTDManager,
    numberOfPomodoros,
    configureRest,
    setCyclesQTDManager,
    configureWork,
    props.cycles,
    completedCycles,
  ]);

  return (
    <div className="pomodoro">
      <h2>You are: {working ? 'working...' : 'resting...'} </h2>
      <Timer mainTime={mainTime}></Timer>
      <div className="controls">
        <Button text="Work" onClick={() => configureWork()}></Button>
        <Button text="Rest" onClick={() => configureRest(false)}></Button>
        <Button
          className={!working && !resting ? 'hidden' : ''}
          text={timeCounting ? 'Pause' : 'Play'}
          onClick={() => setTimeCounting(!timeCounting)}
        ></Button>
      </div>
      <div className="details">
        <p>Completed cycles: {completedCycles}</p>
        <p>Worked hours: {secondsToTime(fullWorkingTime)}</p>
        <p>Completed Pomodoros: {numberOfPomodoros}</p>
      </div>
    </div>
  );
}
