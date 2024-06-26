import React from "react";
import { useState, useRef, useEffect } from "react";
import "./timerStyle.css";
import { IconButton } from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import "@mui/material/styles";
import { RuleFolderSharp } from "@mui/icons-material";

// The state for our timer
// export const [second, setSeconds] = useState(10);
// export const [minute, setMinutes] = useState(0);
// export const [hour, setHours] = useState(0);
// export const [deadline, setDeadline] = useState<Date | null>(null);

let timer = "00:00:00";
let second = 0;
let minute = 10;
let hour = 0;
let deadline = null;

export const Ref = useRef<NodeJS.Timeout | null>(null);


// calculate time remaining in the timer by subtracting the current date/time from the deadline time
export const getTimeRemaining = (e: string) => {
    const total = Date.parse(e) - Date.parse(new Date().toString());
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
export const setTime = (e: Date) => {
    let { total, hours, minutes, seconds } = getTimeRemaining(e.toString()); // update the timer
    if (total >= 0) {
      // check if less than 10 then we need to add '0' at the beginning of the variable
      timer = 
        (hours > 9 ? hours : "0" + hours) +
          ":" +
          (minutes > 9 ? minutes : "0" + minutes) +
          ":" +
          (seconds > 9 ? seconds : "0" + seconds)
    }
  };

//starts the timer
export const startTimer = (e: Date) => {
    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => setTime(e), 1000);
    Ref.current = id;
  };


//sets the deadline for the timer (what the timer is counting down to)
export const getDeadTime = () => {
    let newDeadline = new Date();

    // This is where you specify how many minute, hours you want in your timer
    newDeadline.setSeconds(newDeadline.getSeconds() + second);
    newDeadline.setMinutes(newDeadline.getMinutes() + minute);
    newDeadline.setHours(newDeadline.getHours() + hour);
    deadline = newDeadline

    return deadline;
  };

//increase the timer by 5 minutes (5 seconds for testing purposes rn)
export const increaseTime = (e: Date) => {
    //increasing the set time by 5 seconds
    minute += 5;
    setTime(getDeadTime()); //reloading the timer display
  };


//decrease the timer by 5 minutes (5 seconds for testing purposes rn)
export const decreaseTime = (e: Date) => {
    //increasing the set time by 5 seconds
    minute -= 5;
  };


