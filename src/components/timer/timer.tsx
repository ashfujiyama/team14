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
  const [pausedTime, setPausedTime] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(initialDeadline);
  const [duration, setDuration] = useState(initDuration);
  let doneinit = false;
  let pausedOnOpen = false;

  // console.log(deadline);
  // console.log(duration);

  // The state for our timer
  const [timerDisplay, setTimerDisplay] = useState("00:00:00");

  //for resetting
  // useEffect(() => {
  //   chrome.storage.local.clear(function() {
  //     var error = chrome.runtime.lastError;
  //     if (error) {
  //         console.error(error);
  //     }
  //     // do something more
  //   });
  //   chrome.storage.sync.clear();
  // }, []);

    // uncomment to clear things for testing


  
  useEffect(() => {
    doneinit = false;
    // initialize pausedTime with chrome storage and update when pausedTime changes
    chrome.storage.sync.get("pausedTime", (result) => {
      const storedPausedTime = result.pausedTime;
      if (!storedPausedTime) {
        chrome.storage.sync.set({ pausedTime: paused }, () => {
          if (paused != null) {
            setPausedTime(paused.toString());
          }
          console.log("made new pausedTime tracker");
          console.log("deadline", deadline);
          console.log("paused: ", paused);
          pausedOnOpen = false;
        });
      } else {
        pausedOnOpen = true;
        setPausedTime(storedPausedTime);
      }
    });

    //duration (since deadline depends on duration)
    chrome.storage.sync.get("duration", (result) => {
      if (result.duration && result.duration >= 0) {
        console.log("fetched duration from storage")
        setDuration(result.duration);
      } else {
        setDuration(initDuration);
        chrome.storage.sync.set({ "duration": initDuration }, () => {
          console.log("made new duration tracker");
        });
      }
    });

    //deadline depends on both pausedtime and duration
    chrome.storage.sync.get("deadline", (result) => {
      //check first if it's paused.  if so, you must construct deadline from the paused time and duration saved from chrome storage (fetched earlier in this function)
      //otherwise, deadline either stays the same (if it's saved) bc it was running in the background, or it's initialized
      if (pausedTime) {
        //deadline = now + duration
        let sec = duration % 60;
        let min = (duration / 60) % 60;
        let hour = (duration / 60 / 60 ) % 60;
        let newdead = new Date(pausedTime);
        newdead.setHours(newdead.getHours() + hour);
        newdead.setMinutes(newdead.getMinutes() + min);
        newdead.setSeconds(newdead.getSeconds() + sec);
        setDeadline(newdead);
        chrome.storage.sync.set({"deadline": newdead});
        console.log("deadline is calculated as a function of pausedtime and duration");
      } else {
        if (result.deadline) {
          setDeadline(result.deadline);
          console.log("resuming timer from background");
        } else {
          setDeadline(initialDeadline);
          chrome.storage.sync.set({"deadline": initialDeadline});
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!pausedOnOpen || (pausedOnOpen && doneinit)) {
      chrome.storage.sync.set({ pausedTime}, () => {
        console.log("Time at pause:", pausedTime);
      });
      if (pausedTime == null) {
        console.log("unpaused");
      }
      if (deadline && pausedTime) {
        let temp = initDuration;
        temp = (Date.parse(deadline.toString()) - Date.parse((new Date(pausedTime)).toString()))/ 1000 ;
        if ( temp > 0) {
          chrome.storage.sync.set({ "duration": temp }, () => {
            console.log("big number deadline:", deadline);
            console.log("small number pausetime:", pausedTime);
            console.log("paused time, here is duration:", temp);
          });
          setDuration(temp);
          //onClickReset();
        } else {
          chrome.storage.sync.set({ "duration": 0 }, () => {
            console.log("duration is zero at pause");
          });
          setDuration(temp);
          //onClickReset();
        }
        chrome.storage.sync.set({ "deadline": null }, () => {
          console.log("deadline now null");
        });
      }
    }
    doneinit = true;
    //setDeadline(null);
  }, [pausedTime]);


  useEffect(() => {
    if (deadline != null && deadline > new Date()) {
      chrome.storage.sync.set({ deadline }, () => {
        console.log("deadline changed to ", deadline);
      });
    }
    if (deadline == null ) {
      chrome.storage.sync.set({ deadline }, () => {
        console.log("deadline is null");
      });
    }
  }, [deadline]);


  //sets the deadline for the timer (what the timer is counting down to)
  const getDeadTime = () => {
    //changed deadline to temp bc not sure if it's overwriting stuff or accessing the wrong deadline
    let temp = new Date();

    // This is where you specify how many minute, hours you want in your timer
    temp.setSeconds(temp.getSeconds() + duration);
    // deadline.setMinutes(deadline.getMinutes() + minute);
    // deadline.setHours(deadline.getHours() + hour);
    setDeadline(temp);

    return temp;
  };

  const getDefaultDeadTime = () => {
    //changed deadline to temp bc not sure if it's overwriting stuff or accessing the wrong deadline
    let temp = new Date();

    // This is where you specify how many minute, hours you want in your timer
    temp.setSeconds(temp.getSeconds() + initDuration);
    // deadline.setMinutes(deadline.getMinutes() + minute);
    // deadline.setHours(deadline.getHours() + hour);
    setDeadline(temp);

    return temp;
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

  const updateTimerDisplayDefault = () => {
    if (deadline != null) setTimerDisplayFromDate(getDefaultDeadTime());
  };
  const updateTimerDisplay = () => {
    if (deadline != null) setTimerDisplayFromDate(getDeadTime());
   }

  //resets the timer with the previous deadline
  const onClickReset = () => {
    if (Ref.current) {
      clearInterval(Ref.current);
    }
    updateTimerDisplayDefault();
    setPausedTime(null);
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
    
    chrome.storage.sync.get("duration", (dur) => {
      if (dur.duration) {
        setDuration(dur.duration);
        console.log("onclickresum: set duration to ", dur.duration);
      }
    });
    if(pausedTime != null && duration != null) {
      console.log("onclickresume: set deadline using duration of", duration);
      let sec = duration % 60;
      let min = (duration / 60) % 60;
      let hour = (duration / 60 / 60 ) % 60;
      let newdead = new Date();
      newdead.setHours(newdead.getHours() + hour);
      newdead.setMinutes(newdead.getMinutes() + min);
      newdead.setSeconds(newdead.getSeconds() + sec);
      setDeadline(newdead);
      chrome.storage.sync.set({"onclickresume new deadline": newdead});
      setTimerDisplayFromDate(newdead);
      startTimer(newdead);
      setPausedTime(null);
    }
    /*
    if (pausedTime != null && deadline != null) {
      const remainingTime = deadline.getTime() - new Date(pausedTime).getTime();
      const newDeadline = new Date(Date.now() + remainingTime);
      setDeadline(newDeadline);
      const s = Math.floor((remainingTime / 1000));

      setTimerDisplayFromDate(newDeadline);
      startTimer(newDeadline);
      setPausedTime(null);
    }*/
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
    console.log('inc', duration)
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

  // display current deadline time when open chrome
  useEffect(() => {
    if (initialDeadline != null && pausedTime == null) {
      updateTimerDisplayDefault();
    } else {
        if(deadline != null){
            setTimerDisplayFromDate(deadline)
        }
    }
  }, []); // Need this to run once on component mount


  // if application was paused when closed, automatically starts countdown when deploy
  useEffect(() => {
    if (pausedTime != null){
       onClickResume();
       console.log("here")
    } 
  }, []); 

  //starts the timer
  const onClickStart = () => {
    // const newDeadline = new Date(Date.now() + duration);
    // setDeadline(newDeadline);
    // console.log(deadline);
    // if (deadline != null) startTimer(deadline);
    startTimer(getDefaultDeadTime());
  };

  const onClickPause = () => {
    if (Ref.current) {
      clearInterval(Ref.current);
      setPausedTime(new Date(Date.now()).toString());
    }
  };

    // updae timer based on mode
    useEffect(() => {
    

    //Add event listener for changes in Chrome storage
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (changes["currMode"]) {
        chrome.storage.sync.get("currMode", (result) => {
            const storedMode = result.currMode;
            if (storedMode) {
                if (storedMode == "Break") {
                    setDuration(5);
                    setDeadline(new Date(Date.now() + duration));
                    updateTimerDisplay();
                  } else {
                    setDuration(10);
                    setDeadline(new Date(Date.now() + duration));
                    updateTimerDisplay();
                  }
            }
          });
      }
    });

    // Clean up event listener when component unmounts
    return () => {
      chrome.storage.onChanged.removeListener((changes, namespace) => {
        if (changes["currMode"]) {
            chrome.storage.sync.get("currMode", (result) => {
                const storedMode = result.currMode;
                if (storedMode) {
                    if (storedMode == "Break") {
                        setDuration(5);
                        setDeadline(new Date(Date.now() + initDuration));
                        updateTimerDisplay();
                      } else {
                        setDuration(10);
                        setDeadline(new Date(Date.now() + initDuration));
                        updateTimerDisplay();
                      }
                }
              });
        }
      });
    };
  }, []);

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


// *********** when the timer closes set paused time to reactivate when reopen

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