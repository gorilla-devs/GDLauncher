import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { SketchPicker } from 'react-color';
import styles from './UserInterface.scss';
import SettingCard from '../SettingCard/SettingCard';
import Title from '../Title/Title';
import SelectSetting from '../SelectSetting/SelectSetting';
import * as SettingsActions from '../../../../actions/settings';
import shader from '../../../../utils/colors';

const themes = ['Blue', 'Black', 'Green'];

const UserInterface = props => {
  return (
    <div>
      <Title>User Interface Preferences</Title>
      <SettingCard>
        <SelectSetting
          mainText={
            <span>
              Select Theme{' '}
              <a onClick={props.resetStyles} style={{ fontSize: 13 }}>
                Reset Theme
              </a>
            </span>
          }
          description="Adjust these values to fit your taste"
          icon="layout"
          onChange={props.setTheme}
          options={themes}
        />
        <div className={styles.pickersContainer}>
          <div>
            Primary Color{' '}
            <SketchPicker
              onChange={v => props.setThemeValue('primary', v.hex)}
              onChangeComplete={v => props.saveThemeValue('primary', v.hex)}
              color={props.settings.theme.primary}
            />
          </div>
          <div>
            Secondary Color{' '}
            <SketchPicker
              onChange={v => {
                props.setThemeValue('secondary-color-1', v.hex);
                props.setThemeValue('secondary-color-2', shader(v.hex, 10));
                props.setThemeValue('secondary-color-3', shader(v.hex, 30));
              }}
              onChangeComplete={v => {
                props.saveThemeValue('secondary-color-1', v.hex);
                props.saveThemeValue('secondary-color-2', shader(v.hex, 10));
                props.saveThemeValue('secondary-color-3', shader(v.hex, 30));
              }}
              color={props.settings.theme['secondary-color-1']}
            />
          </div>
        </div>
      </SettingCard>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    settings: state.settings
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(SettingsActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserInterface);
