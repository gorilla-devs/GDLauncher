import React from 'react';
import { connect } from 'react-redux';
import { Input, Button } from 'antd';
import styles from './ServerManager.scss';

function Command(props){
  return(
    <div className={styles.rowSettings}>
    <div className={styles.FirstSetting} >
      {props.command}
    </div>
    <Input className={styles.SecondSetting}
      //value={props.commands[command]}
      //onChange={(e) => ServerCommandsChangeValueTWO(e, command)}
    />
    <Button.Group className={styles.ButtonGroup}>
      <Button type="primary" >run</Button>
      <Button type="primary">remove</Button>
    </Button.Group>
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