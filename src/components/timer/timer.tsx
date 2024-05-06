// timer countdown with timer controller buttoms (start, stop, restart, skip)
// keep track of time elapsed and add to progress if complete
import React from "react";
import { useState, useRef, useEffect } from "react";
import "./timerStyle.css";
import { IconButton } from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import "@mui/material/styles";
import { RuleFolderSharp } from "@mui/icons-material";
import * as timerUtils from "./timerUtils"
import Switch from "./modes"
// import notification from '../src/notifications'

interface TimerProps {
    initialDeadline: Date | null;
    initDuration: number | 0;
    paused: Date | null;
  }
  
const Timer: React.FC<TimerProps> = ({ initialDeadline, initDuration, paused }) => {
  const Ref = useRef<NodeJS.Timeout | null>(null);

  // actual state of the timer
  const [pausedTime, setPausedTime] = useState<Date | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(initialDeadline);
  const [duration, setDuration] = useState(initDuration);
  console.log(deadline)

  // The state for our timer
  const [timerDisplay, setTimerDisplay] = useState("00:00:00");

    //sets the deadline for the timer (what the timer is counting down to)
  const getDeadTime = () => {
    let deadline = new Date();

    // This is where you specify how many minute, hours you want in your timer
    deadline.setSeconds(deadline.getSeconds() + duration);
    // deadline.setMinutes(deadline.getMinutes() + minute);
    // deadline.setHours(deadline.getHours() + hour);
    setDeadline(deadline);

    return deadline;
  };


  // additional accessors
  const isPaused = () => {
    return pausedTime != null;
  }

  // calculate time remaining in the timer by subtracting the current date/time from the deadline time
  const getTimeRemaining = (e: Date) => {
    const total = Date.parse(e.toString()) - Date.parse(new Date().toString());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);
    return {
      total,
      hours,
      minutes,
      seconds,
    };
  };

  //takes in a current deadline and sets the timer variable to display the time
  const setTimerDisplayFromDate = (e: Date) => {
    let { total, hours, minutes, seconds } = getTimeRemaining(e); // update the timer
    if (total >= 0) {
      // check if less than 10 then we need to add '0' at the beginning of the variable
      setTimerDisplay(
        (hours > 9 ? hours : "0" + hours) +
          ":" +
          (minutes > 9 ? minutes : "0" + minutes) +
          ":" +
          (seconds > 9 ? seconds : "0" + seconds)
      );
    }
  };

  const updateTimerDisplay = () => {
    if (deadline != null) setTimerDisplayFromDate(getDeadTime());
   }

  //resets the timer with the previous deadline
  const onClickReset = () => {
    if (Ref.current) {
      clearInterval(Ref.current);
    }
    updateTimerDisplay();
  };

  //starts the timer
  const startTimer = (e: Date) => {
    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => setTimerDisplayFromDate(e), 1000);
    Ref.current = id;
  };

  // resumes the timer by getting the time when it was stopped, subtracting from the previous deadline
  // creating a new deadline to start the timer again
  const onClickResume = () => {
    if (pausedTime != null && deadline != null) {
      const remainingTime = deadline.getTime() - pausedTime.getTime();
      const newDeadline = new Date(Date.now() + remainingTime);
      setDeadline(newDeadline);
      const s = Math.floor((remainingTime / 1000));

      setTimerDisplayFromDate(newDeadline);
      startTimer(newDeadline);
      setPausedTime(null);
    }
  };

  const increaseTimeGeneral = (d: Date, hoursDelta: number, minutesDelta: number, secondsDelta: number) => {
    let newDate = new Date();
    newDate.setSeconds(d.getSeconds() + secondsDelta);
    newDate.setMinutes(d.getMinutes() + minutesDelta);
    newDate.setHours(d.getHours() + hoursDelta);
    console.log(duration)
    return newDate;
  }

  const increaseDeadline = (hoursDelta: number, minutesDelta: number, secondsDelta: number) => {
    if (deadline != null) setDeadline(increaseTimeGeneral(deadline, hoursDelta, minutesDelta, secondsDelta));
  }

  //increase the timer by 5 minutes (5 seconds for testing purposes rn)
  const increaseTime = (e: Date) => {
    //increasing the set time by 5 seconds
    setDuration(duration + 5);
    // increaseDeadline(0, 5, 0);
    updateTimerDisplay(); //reloading the timer display
  };

  //decrease the timer by 5 minutes (5 seconds for testing purposes rn)
  const decreaseTime = (e: Date) => {
    //increasing the set time by 5 seconds
    // increaseDeadline(0, -5, 0);
    setDuration(duration - 5);
    console.log(duration);
    updateTimerDisplay(); //reloading the timer display
  };

  const onClickInc = () => {
    if (deadline != null && (deadline.getHours() - (new Date).getHours() ) < 2 && !isPaused()) {
      increaseTime(deadline);
      updateTimerDisplay(); //reloading the timer display
    }
  };

  const onClickDec = () => {
    if (deadline != null && deadline != new Date && !isPaused()) {
      decreaseTime(deadline);
      updateTimerDisplay(); //reloading the timer display
    }
  };

  useEffect(() => {
    if (initialDeadline != null){
        updateTimerDisplay();
    }
    
  }, []); // Need this to run once on component mount

  //starts the timer
  const onClickStart = () => {
    // const newDeadline = new Date(Date.now() + duration);
    // setDeadline(newDeadline);
    // console.log(deadline);
    // if (deadline != null) startTimer(deadline);
    startTimer(getDeadTime());
  };

  const onClickPause = () => {
    if (Ref.current) {
      clearInterval(Ref.current);
      setPausedTime(new Date(Date.now()));
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2 className="timeLeft">{timerDisplay}</h2>
      <div className="arrowContainer">
        <IconButton
          style={{
            margin: "0px",
            color: "black",
            backgroundColor: "transparent",
          }}
          onClick={onClickInc}
        >
          <ArrowDropUpIcon />
        </IconButton>
        <IconButton
          style={{
            margin: "0px",
            fontSize: "10px",
            color: "black",
            backgroundColor: "transparent",
          }}
          onClick={onClickDec}
        >
          <ArrowDropDownIcon />
        </IconButton>
      </div>

      <div>
        {!isPaused() ? (
          <button onClick={onClickStart}>Start</button>
        ) : (
          <button onClick={onClickResume}>Resume</button>
        )}
        <button className="reset" onClick={onClickReset}>
          Reset
        </button>
        {!isPaused() && (
          <button className="pause" onClick={onClickPause}>
            Pause
          </button>
        )}
      </div>

    </div>
  );
};

export default Timer;

// pause: need to store time remaining whe the user pauses. To restart need to set a new deadline time with the time left


// timer countdown with timer controller buttoms (start, stop, restart, skip)
// keep track of time elapsed and add to progress if complete
// timer countdown with timer controller buttoms (start, stop, restart, skip)
// keep track of time elapsed and add to progress if complete
// import React from "react";
// import { useState, useRef, useEffect } from "react";
// import "./timerStyle.css";
// import { IconButton } from "@mui/material";
// import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
// import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
// import "@mui/material/styles";
// import { RuleFolderSharp } from "@mui/icons-material";
// // import notification from '../src/notifications'

// interface TimerProps {
//     initialDeadline: Date | null;
//     duration: number | 0;
//     paused: Date | null;
//   }
  
// // get propositions passed in from tomodoro to keep track of what to set the timer to. InitDeadline is the dealdine it is counting down to 
// // duraiton is how long we are setting the timer to (its 10 seconds right now)
// const Timer: React.FC<TimerProps> = ({ initialDeadline, duration }) => {
//   const Ref = useRef<NodeJS.Timeout | null>(null);

//   const [second, setSeconds] = useState(10);
//   const [minute, setMinutes] = useState(0);
//   const [hour, setHours] = useState(0);
//   const [isPaused, setIsPaused] = useState(false);
//   const [pausedTime, setPausedTime] = useState<number | null>(null);
//   const [deadline, setDeadline] = useState<Date | null>(null);

//   // The state for our timer
//   const [timer, setTimer] = useState("00:00:00");

//   // calculate time remaining in the timer by subtracting the current date/time from the deadline time
//   const getTimeRemaining = (e: string) => {
//     const total = Date.parse(e) - Date.parse(new Date().toString());
//     const seconds = Math.floor((total / 1000) % 60);
//     const minutes = Math.floor((total / 1000 / 60) % 60);
//     const hours = Math.floor((total / 1000 / 60 / 60) % 24);
//     return {
//       total,
//       hours,
//       minutes,
//       seconds,
//     };
//   };

//   //takes in a current deadline and sets the timer variable to display the time
//   const setTime = (e: Date) => {
//     let { total, hours, minutes, seconds } = getTimeRemaining(e.toString()); // update the timer
//     if (total >= 0) {
//       // check if less than 10 then we need to add '0' at the beginning of the variable
//       setTimer(
//         (hours > 9 ? hours : "0" + hours) +
//           ":" +
//           (minutes > 9 ? minutes : "0" + minutes) +
//           ":" +
//           (seconds > 9 ? seconds : "0" + seconds)
//       );
//     }
//   };

//   //resets the timer with the previous deadline
//   const onClickReset = () => {
//     if (Ref.current) {
//       clearInterval(Ref.current);
//     }
//     setTime(getDeadTime());
//   };

//   //starts the timer
//   const startTimer = (e: Date) => {
//     if (Ref.current) clearInterval(Ref.current);
//     const id = setInterval(() => setTime(e), 1000);
//     Ref.current = id;
//   };

//   // resumes the timer by getting the time when it was stopped, subtracting from the previous deadline
//   // creating a new deadline to start the timer again
//   const onClickResume = () => {
//     if (pausedTime != null && deadline != null) {
//       const remainingTime = deadline.getTime() - pausedTime;
//       const newDeadline = new Date(Date.now() + remainingTime);
//       setDeadline(newDeadline);
//       const s = Math.floor((remainingTime / 1000) % 60);

//       setTime(newDeadline);
//       startTimer(newDeadline);
//       setIsPaused(false);
//       setPausedTime(null);
//     }
//   };

//   //sets the deadline for the timer (what the timer is counting down to)
//   const getDeadTime = () => {
//     let deadline = new Date();

//     // This is where you specify how many minute, hours you want in your timer
//     deadline.setSeconds(deadline.getSeconds() + duration);
//     // deadline.setMinutes(deadline.getMinutes() + minute);
//     // deadline.setHours(deadline.getHours() + hour);
//     setDeadline(deadline);

//     return deadline;
//   };

//   //increase the timer by 5 minutes (5 seconds for testing purposes rn)
//   const increaseTime = (e: Date) => {
//     //increasing the set time by 5 seconds
//     setMinutes(minute + 5);
//     setTime(getDeadTime()); //reloading the timer display

//     console.log(minute);
//   };

//   //decrease the timer by 5 minutes (5 seconds for testing purposes rn)
//   const decreaseTime = (e: Date) => {
//     //increasing the set time by 5 seconds
//     setMinutes(minute - 5);
//   };

//   const onClickInc = () => {
//     if (minute < 90 && !isPaused) {
//       increaseTime(getDeadTime());
//     }
//   };

//   const onClickDec = () => {
//     if (minute > 0 && !isPaused) {
//       decreaseTime(getDeadTime());
//     }
//     setTime(getDeadTime()); //reloading the timer display
//   };

//   //starts the timer
//   const onClickStart = () => {
//     startTimer(getDeadTime());
//   };

//   const onClickPause = () => {
//     if (Ref.current) {
//       clearInterval(Ref.current);
//       setPausedTime(Date.now());
//       setIsPaused(true);
//     }
//   };

//   return (
//     <div style={{ textAlign: "center" }}>
//       <h2 className="timeLeft">{timer}</h2>
//       <div className="arrowContainer">
//         <IconButton
//           style={{
//             margin: "0px",
//             color: "black",
//             backgroundColor: "transparent",
//           }}
//           onClick={onClickInc}
//         >
//           <ArrowDropUpIcon />
//         </IconButton>
//         <IconButton
//           style={{
//             margin: "0px",
//             fontSize: "10px",
//             color: "black",
//             backgroundColor: "transparent",
//           }}
//           onClick={onClickDec}
//         >
//           <ArrowDropDownIcon />
//         </IconButton>
//       </div>

//       <div>
//         {!isPaused ? (
//           <button onClick={onClickStart}>Start</button>
//         ) : (
//           <button onClick={onClickResume}>Resume</button>
//         )}
//         <button className="reset" onClick={onClickReset}>
//           Reset
//         </button>
//         {!isPaused && (
//           <button className="pause" onClick={onClickPause}>
//             Pause
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Timer;

// // pause: need to store time remaining whe the user pauses. To restart need to set a new deadline time with the time left