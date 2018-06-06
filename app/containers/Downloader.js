import { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';




class Downloader extends Component {
  constructor() {
    super()

    this.intervalId = null
    this.startClock = this.startClock.bind(this)
    this.stopClock = this.stopClock.bind(this)
    this.getCurrentTime = this.getCurrentTime.bind(this)
  }

  componentDidMount() {
    this.startClock()
  }

  componentWillUnmount() {
    this.stopClock()
  }

  startClock() {
    this.intervalId = setInterval(this.getCurrentTime, 5000)
  }

  stopClock() {
    clearInterval(this.intervalId)
  }

  getCurrentTime() {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()

    this.props.updateTime(hours, minutes, seconds)
  }

  render() {
    return null;
  }
}

function mapStateToProps(state) {
  return {
    location: state.router.location.pathname
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(null, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Downloader);
