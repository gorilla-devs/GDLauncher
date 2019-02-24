import React from 'react';
import { connect } from 'react-redux';
import { Input, Button, Switch } from 'antd';
import { Link } from 'react-router-dom';
import styles from './ServerManager.scss';

function switchFunc() {

}

function Command(props) {
  if (props.switch == "true") {
    return (
      <div className={styles.rowSettings}>
        <div className={styles.FirstSetting} >
          {props.command}
        </div>
        <Switch className={styles.switch} onChange={switchFunc} />
      </div>
    );
  } else

    return (
      <div className={styles.rowSettings}>
        <div className={styles.FirstSetting} >
          {props.command}
        </div>
        <Link
          to={{
            pathname: `/ServerCommandsModal`,
            state: { modal: true }
          }}
          className={styles.commandButton}
        >
          <Button type="primary" className={styles.commandButton}>run</Button>
        </Link>
      </div>
    );

}


function mapStateToProps(state) {
  return {
    versionsManifest: state.packCreator.versionsManifest,
    packName: state.serverManager.packName, //testare
    start: state.serverManager.process
  };
}

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(Command);