import {useRef, useState} from "react";
import "./App.scss";

const accurateInterval = (fn, time) => {
    var cancel, nextAt, timeout, wrapper;
    nextAt = new Date().getTime() + time;
    timeout = null;
    wrapper = function () {
        nextAt += time;
        timeout = setTimeout(wrapper, nextAt - new Date().getTime());
        return fn();
    };
    cancel = function () {
        return clearTimeout(timeout);
    };
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return {
        cancel: cancel,
    };
};

function App() {
    const [brkLength, setBrkLength] = useState(5);
    const [seshLength, setSeshLength] = useState(25);
    const [timerState, setTimerState] = useState("stopped");
    const [timer, setTimer] = useState(1500);
    const [timerType, setTimerType] = useState("Session");
    const [intervalID, setIntervalID] = useState("");
    const [alarmColor, setAlarmClock] = useState({color: "black"});

    const audioBeep = useRef(null);

    const lengthControl = (stateToChange, sign, currentLength, type) => {
        if (timerState === "running") {
            return;
        }
        if (timerType === type) {
            if (sign === "-" && currentLength !== 1) {
                if (stateToChange === "brkLength") {
                    setBrkLength(currentLength - 1);
                } else {
                    setSeshLength(currentLength - 1);
                }
            } else if (sign === "+" && currentLength !== 60) {
                if (stateToChange === "brkLength") {
                    setBrkLength(currentLength + 1);
                } else {
                    setSeshLength(currentLength + 1);
                }
            }
        } else if (sign === "-" && currentLength !== 1) {
            if (stateToChange === "brkLength") {
                setBrkLength(currentLength - 1);
            } else {
                setSeshLength(currentLength - 1);
            }
            setTimer(currentLength * 60 - 60);
        } else if (sign === "+" && currentLength !== 60) {
            if (stateToChange === "brkLength") {
                setBrkLength(currentLength + 1);
            } else {
                setSeshLength(currentLength + 1);
            }
            setTimer(currentLength * 60 + 60);
        }
    };

    const changeBrkLength = (e) => {
        lengthControl("brkLength", e.currentTarget.value, brkLength, "Session");
    };

    const changeSeshLength = (e) => {
        lengthControl("seshLength", e.currentTarget.value, seshLength, "Break");
    };

    const timerControl = () => {
        if (timerState === "stopped") {
            setTimerState("running");
            beginCountDown();
        } else {
            setTimerState("stopped");
            if (intervalID) {
                intervalID.cancel();
            }
        }
    };

    const beginCountDown = () => {
        setIntervalID(
            accurateInterval(() => {
                decrementTimer();
                phaseControl();
            }, 1000)
        );
    };

    const decrementTimer = () => {
        setTimer((timer) => timer - 1);
    };

    const phaseControl = () => {
        let theTimer = (asd) => timer;
        console.log(theTimer);
        warning(theTimer);
        buzzer(theTimer);
        if (theTimer < 0) {
            if (intervalID) {
                intervalID.cancel();
            }
            if (timerType === "Session") {
                beginCountDown();
                switchTimer(brkLength * 60, "Break");
            } else {
                beginCountDown();
                switchTimer(seshLength * 60, "Session");
            }
        }
    };

    const warning = (_timer) => {
        if (_timer < 61) {
            setAlarmClock({color: "#a50d0d"});
        } else {
            setAlarmClock({color: "black"});
        }
    };
    const buzzer = (_timer) => {
        if (_timer === 0) {
            audioBeep.current.play();
        }
    };
    const switchTimer = (num, str) => {
        setTimer(num);
        setTimerType(str);
        setAlarmClock({color: "black"});
    };

    const clockify = () => {
        let minutes = Math.floor(timer / 60);
        let seconds = timer - minutes * 60;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        return minutes + ":" + seconds;
    };

    const reset = () => {
        setBrkLength(5);
        setSeshLength(25);
        setTimerState("stopped");
        setTimer(1500);
        setTimerType("Session");
        setIntervalID("");
        setAlarmClock({color: "black"});
        if (intervalID) {
            intervalID.cancel();
        }
        audioBeep.current.pause();
        audioBeep.current.currentTime = 0;
    };

    return (
        <div className="App">
            <div className="clock">
                <div className="title">25 + 5 Clock</div>
                <div className="config">
                    <div className="length-control">
                        <div id="break-label">Break Length</div>
                        <button
                            className="btn-level"
                            id="break-decrement"
                            onClick={changeBrkLength}
                            value="-">
                            <i className="fa fa-arrow-down fa-2x"></i>
                        </button>
                        <div className="btn-level" id="break-length">
                            {brkLength}
                        </div>
                        <button
                            className="btn-level"
                            id="break-increment"
                            onClick={changeBrkLength}
                            value="+">
                            <i className="fa fa-arrow-up fa-2x"></i>
                        </button>
                    </div>
                    <div className="length-control">
                        <div id="session-label">Session Length</div>
                        <button
                            className="btn-level"
                            id="session-decrement"
                            onClick={changeSeshLength}
                            value="-">
                            <i className="fa fa-arrow-down fa-2x"></i>
                        </button>
                        <div className="btn-level" id="session-length">
                            {seshLength}
                        </div>
                        <button
                            className="btn-level"
                            id="session-increment"
                            onClick={changeSeshLength}
                            value="+">
                            <i className="fa fa-arrow-up fa-2x"></i>
                        </button>
                    </div>
                </div>
                <div className="timer-container" style={alarmColor}>
                    <div className="timer-label">{timerType}</div>
                    <div className="timer" id="time-left">
                        {clockify()}
                    </div>
                </div>
                <div className="controls">
                    <button className="control" onClick={timerControl}>
                        <i className="fas fa-play fa-2x"></i>
                        <i className="fas fa-pause fa-2x"></i>
                    </button>
                    <button className="control" onClick={reset}>
                        <i className="fas fa-refresh fa-2x"></i>
                    </button>
                </div>
                <audio
                    id="beep"
                    preload="auto"
                    ref={audioBeep}
                    src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
                />
            </div>
        </div>
    );
}

export default App;
