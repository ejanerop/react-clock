import {Component} from "react";
import "./App.scss";

const accurateInterval = function (fn, time) {
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

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            brkLength: 5,
            seshLength: 25,
            timerState: "stopped",
            timerType: "Session",
            timer: 1500,
            intervalID: "",
            alarmColor: {color: "black"},
        };
        this.setBrkLength = this.setBrkLength.bind(this);
        this.setSeshLength = this.setSeshLength.bind(this);
        this.lengthControl = this.lengthControl.bind(this);
        this.timerControl = this.timerControl.bind(this);
        this.beginCountDown = this.beginCountDown.bind(this);
        this.decrementTimer = this.decrementTimer.bind(this);
        this.phaseControl = this.phaseControl.bind(this);
        this.warning = this.warning.bind(this);
        this.buzzer = this.buzzer.bind(this);
        this.switchTimer = this.switchTimer.bind(this);
        this.clockify = this.clockify.bind(this);
        this.reset = this.reset.bind(this);
    }
    setBrkLength(e) {
        this.lengthControl(
            "brkLength",
            e.currentTarget.value,
            this.state.brkLength,
            "Session"
        );
    }
    setSeshLength(e) {
        this.lengthControl(
            "seshLength",
            e.currentTarget.value,
            this.state.seshLength,
            "Break"
        );
    }
    lengthControl(stateToChange, sign, currentLength, timerType) {
        if (this.state.timerState === "running") {
            return;
        }
        if (this.state.timerType === timerType) {
            if (sign === "-" && currentLength !== 1) {
                this.setState({[stateToChange]: currentLength - 1});
            } else if (sign === "+" && currentLength !== 60) {
                this.setState({[stateToChange]: currentLength + 1});
            }
        } else if (sign === "-" && currentLength !== 1) {
            this.setState({
                [stateToChange]: currentLength - 1,
                timer: currentLength * 60 - 60,
            });
        } else if (sign === "+" && currentLength !== 60) {
            this.setState({
                [stateToChange]: currentLength + 1,
                timer: currentLength * 60 + 60,
            });
        }
    }
    timerControl() {
        if (this.state.timerState === "stopped") {
            this.beginCountDown();
            this.setState({timerState: "running"});
        } else {
            this.setState({timerState: "stopped"});
            if (this.state.intervalID) {
                this.state.intervalID.cancel();
            }
        }
    }
    beginCountDown() {
        this.setState({
            intervalID: accurateInterval(() => {
                this.decrementTimer();
                this.phaseControl();
            }, 1000),
        });
    }
    decrementTimer() {
        this.setState({timer: this.state.timer - 1});
    }
    phaseControl() {
        let timer = this.state.timer;
        this.warning(timer);
        this.buzzer(timer);
        if (timer < 0) {
            if (this.state.intervalID) {
                this.state.intervalID.cancel();
            }
            if (this.state.timerType === "Session") {
                this.beginCountDown();
                this.switchTimer(this.state.brkLength * 60, "Break");
            } else {
                this.beginCountDown();
                this.switchTimer(this.state.seshLength * 60, "Session");
            }
        }
    }
    warning(_timer) {
        if (_timer < 61) {
            this.setState({alarmColor: {color: "#a50d0d"}});
        } else {
            this.setState({alarmColor: {color: "white"}});
        }
    }
    buzzer(_timer) {
        if (_timer === 0) {
            this.audioBeep.play();
        }
    }
    switchTimer(num, str) {
        this.setState({
            timer: num,
            timerType: str,
            alarmColor: {color: "white"},
        });
    }
    clockify() {
        let minutes = Math.floor(this.state.timer / 60);
        let seconds = this.state.timer - minutes * 60;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        return minutes + ":" + seconds;
    }
    reset() {
        this.setState({
            brkLength: 5,
            seshLength: 25,
            timerState: "stopped",
            timerType: "Session",
            timer: 1500,
            intervalID: "",
            alarmColor: {color: "white"},
        });
        if (this.state.intervalID) {
            this.state.intervalID.cancel();
        }
        this.audioBeep.pause();
        this.audioBeep.currentTime = 0;
    }
    render() {
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
                                onClick={this.setBrkLength}
                                value="-">
                                <i className="fa fa-arrow-down fa-2x"></i>
                            </button>
                            <div className="btn-level" id="break-length">
                                {this.state.brkLength}
                            </div>
                            <button
                                className="btn-level"
                                id="break-increment"
                                onClick={this.setBrkLength}
                                value="+">
                                <i className="fa fa-arrow-up fa-2x"></i>
                            </button>
                        </div>
                        <div className="length-control">
                            <div id="session-label">Session Length</div>
                            <button
                                className="btn-level"
                                id="session-decrement"
                                onClick={this.setSeshLength}
                                value="-">
                                <i className="fa fa-arrow-down fa-2x"></i>
                            </button>
                            <div className="btn-level" id="session-length">
                                {this.state.seshLength}
                            </div>
                            <button
                                className="btn-level"
                                id="session-increment"
                                onClick={this.setSeshLength}
                                value="+">
                                <i className="fa fa-arrow-up fa-2x"></i>
                            </button>
                        </div>
                    </div>
                    <div
                        className="timer-container"
                        style={this.state.alarmColor}>
                        <div className="timer-label">
                            {this.state.timerType}
                        </div>
                        <div className="timer" id="time-left">
                            {this.clockify()}
                        </div>
                    </div>
                    <div className="controls">
                        <button
                            className="control"
                            id="start_stop"
                            onClick={this.timerControl}>
                            <i className="fas fa-play fa-2x"></i>
                            <i className="fas fa-pause fa-2x"></i>
                        </button>
                        <button
                            className="control"
                            id="reset"
                            onClick={this.reset}>
                            <i className="fas fa-refresh fa-2x"></i>
                        </button>
                    </div>
                    <audio
                        id="beep"
                        preload="auto"
                        ref={(audio) => {
                            this.audioBeep = audio;
                        }}
                        src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
                    />
                </div>
            </div>
        );
    }
}

export default App;
