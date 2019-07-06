import {
  SELECT_INSTANCE,
  START_INSTANCE,
  STOP_INSTANCE,
  UPDATE_INSTANCES
} from '../actions/instancesManager';

const initialState = {
  instances: [],
  selectedInstance: null,
  startedInstances: []
};

export default function instancesManager(state = initialState, action) {
  switch (action.type) {
    case UPDATE_INSTANCES:
      return {
        ...state,
        instances: action.instances
      };
    case SELECT_INSTANCE:
      return {
        ...state,
        selectedInstance: action.payload
      };
    case START_INSTANCE:
      return {
        ...state,
        startedInstances: [
          ...state.startedInstances,
          {
            name: action.payload,
            pid: action.pid
          }
        ]
      };
    case STOP_INSTANCE:
      return {
        ...state,
        startedInstances: state.startedInstances.filter(
          el => el.name !== action.payload
        )
      };
    default:
      return state;
  }
}
