import React from 'react';
import { useSelector } from 'react-redux';
import Settings from '../Settings/Settings';
import InstanceCreatorModal from '../InstanceCreatorModal/InstanceCreatorModal';
import CurseModpacksBrowserCreatorModal from '../CurseModpacksBrowserCreatorModal/CurseModpacksBrowserCreatorModal';
import CurseModpackExplorerModal from '../CurseModpackExplorerModal/CurseModpackExplorerModal';
import InstanceManagerModal from '../InstanceManagerModal/InstanceManagerModal';
import ImportPack from '../ImportPack/ImportPack';
import ExportPackModal from '../ExportPackModal/ExportPackModal';
import LoginHelperModal from '../LoginHelperModal/LoginHelperModal';
import ChangelogsModal from '../ChangelogModal/ChangelogModal';
import ConfirmDeleteModal from '../ConfirmDeleteModal/ConfirmDeleteModal';
import JavaGlobalOptionsFixModal from '../JavaGlobalOptionsFixModal/JavaGlobalOptionsFixModal';

const modalsComponentLookupTable = {
  Settings
};

const ModalsManager = props => {
  const currentModals = useSelector(state => state.modals);

  const renderedModals = currentModals.map((modalDescription, index) => {
    const { modalType, modalProps = {} } = modalDescription;
    const ModalComponent = modalsComponentLookupTable[modalType];

    return <ModalComponent {...modalProps} key={modalType + index} />;
  });

  return <span>{renderedModals}</span>;
};

export default ModalsManager;
