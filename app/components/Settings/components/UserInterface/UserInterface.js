import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { SketchPicker } from 'react-color';
import { useTranslation } from 'react-i18next';
import styles from './UserInterface.scss';
import SettingCard from '../SettingCard/SettingCard';
import Title from '../Title/Title';
import SelectSetting from '../SelectSetting/SelectSetting';
import * as SettingsActions from '../../../../actions/settings';
import shader from '../../../../utils/colors';
import { THEMES } from '../../../../constants';

const themes = ['Blue', 'Black', 'Green'];
const primaryPresets = [
  '#16a085',
  '#27ae60',
  '#2980b9',
  '#8e44ad',
  '#2c3e50',
  '#f39c12',
  '#d35400',
  '#c0392b',
  '#f9ca24',
  '#f0932b',
  '#eb4d4b',
  '#6ab04c',
  '#4834d4',
  '#0097e6',
  '#8c7ae6',
  '#192a56'
];

const secondaryPresets = [
  '#34495e',
  '#2c3e50',
  '#95a5a6',
  '#bdc3c7',
  '#353b48',
  '#2f3640',
  '#192a56',
  '#273c75',
  '#2c2c54',
  '#4b6584',
  '#c23616',
  '#B2263D',
  '#D4582F',
  '#1B1464',
  '#0c2461',
  '#0a3d62'
];

const UserInterface = props => {
  const { t } = useTranslation();
  return (
    <div>
      <Title>{t('UserInterfacePreferences', 'User Interface Preferences')}</Title>
      <SettingCard>
        <SelectSetting
          mainText={
            <span>
              {t('SelectedTheme', 'Select Theme')}{' '}
              <a
                onClick={() => props.applyTheme(THEMES.default)}
                style={{ fontSize: 13 }}
              >
                {t('ResetTheme', 'Reset Theme')}
              </a>
            </span>
          }
          description={t('AdjustValuesToFitTaste', 'Adjust these values to fit your taste')}
          icon="layout"
          placeholder={t('SelectATheme', 'Select A Theme')}
          onChange={v =>
            props.applyTheme(
              THEMES[Object.keys(THEMES).find(ver => THEMES[ver].name === v)]
            )
          }
          options={Object.keys(THEMES).map(t => THEMES[t].name)}
        />
        <div className={styles.pickersContainer}>
          <div>
            {t('PrimaryColor', 'Primary Color')}{' '}
            <SketchPicker
              onChange={v => props.setThemeValue('primary', v.hex)}
              onChangeComplete={v => props.saveThemeValue('primary', v.hex)}
              color={props.settings.theme.primary}
              presetColors={primaryPresets}
              disableAlpha
            />
          </div>
          <div>
            {t('SecondaryColor', 'Secondary Color')}{' '}
            <SketchPicker
              onChange={v => {
                props.setThemeValue('secondary-color-1', shader(v.hex, 40));
                props.setThemeValue('secondary-color-2', shader(v.hex, 20));
                props.setThemeValue('secondary-color-3', v.hex);
              }}
              onChangeComplete={v => {
                props.saveThemeValue('secondary-color-1', shader(v.hex, 40));
                props.saveThemeValue('secondary-color-2', shader(v.hex, 20));
                props.saveThemeValue('secondary-color-3', v.hex);
              }}
              color={props.settings.theme['secondary-color-1']}
              presetColors={secondaryPresets}
              disableAlpha
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
