import React, { Component } from 'react';
import {connect} from 'react-redux';
import {
  backAction,
  loadFile,
  createChallenge,
  loadChallenge,
  fileSelect,
  loadFileExplorer,
  fileSaved
} from '../actions/editorActions';

import $ from 'jquery';

import Menu from './Menu';
import SelectChallenge from './SelectChallenge';
import Editor from './Editor';
import FileExplorer from './FileExplorer';
import Modal from 'react-modal';

import injectTapEventPlugin from 'react-tap-event-plugin';
import {RaisedButton, Snackbar} from 'material-ui';

import './../style.css';

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: '50%',
    marginRight: '-50%',
    width: '400px',
    height: '300px',
    transform: 'translate(-50%, -50%)'
  }
};

const connector = connect(function(state) {
  return (
    state
  );
}, null, null, {pure: false});

class GrandCentralStation extends Component {

  constructor(props) {
    super(props);
    this.backView = this.backView.bind(this);
    this.exportFiles = this.exportFiles.bind(this);
    this.handleFileSelect = this.handleFileSelect.bind(this);
    this.handleFileIsSelected = this.handleFileIsSelected.bind(this);
    this.handleChallengeClick = this.handleChallengeClick.bind(this);
    this.handleChallengeDupe = this.handleChallengeDupe.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.modalSave = this.modalSave.bind(this);
    this.forceOpenNav = this.forceOpenNav.bind(this);
    this.handleSnackbar = this.handleSnackbar.bind(this);
    this.handleKeyboardSave = this.handleKeyboardSave.bind(this);

    this.challengeSkeleton = {
      id: "",
      title: "",
      description: [],
      head: [],
      challengeSeed: [],
      tail: [],
      solutions: [],
      tests: [],
      releasedOn: "",
      type: "",
      challengeType: 0,
      nameCn: "",
      descriptionCn: "",
      nameFr: "",
      descriptionFr: "",
      nameRu: "",
      descriptionRu: "",
      nameEs: "",
      descriptionEs: "",
      namePt: "",
      descriptionPt: ""
    };

    // Dimensions are given as [ Height, Width ]

    this.editorLayout = {
      meta: [
        {name: "title", dimens: ['30px', 'auto']},
        {name: "description", dimens: ['180px', 'auto']},
        {name: "releasedOn", dimens: ['30px', 'auto']},
        {name: "type", dimens: ['30px', 'auto']},
        {name: "challengeType", dimens: ['30px', 'auto']}
      ],
      code: [
        {name: "head", dimens: ['180px', 'auto']},
        {name: "challengeSeed", dimens: ['360px', 'auto']},
        {name: "tail", dimens: ['180px', 'auto']}
      ],
      test_solutions: [
        {name: "solutions", dimens: ['240px', 'auto']},
        {name: "tests", dimens: ['240px', 'auto']}
      ],
      localization: [
        {name: "nameCn", dimens: ['30px', 'auto']},
        {name: "descriptionCn", dimens: ['180px', 'auto']},
        {name: "nameFr", dimens: ['30px', 'auto']},
        {name: "descriptionFr", dimens: ['180px', 'auto']},
        {name: "nameRu", dimens: ['30px', 'auto']},
        {name: "descriptionRu", dimens: ['180px', 'auto']},
        {name: "nameEs", dimens: ['30px', 'auto']},
        {name: "descriptionEs", dimens: ['180px', 'auto']},
        {name: "namePt", dimens: ['30px', 'auto']},
        {name: "descriptionPt", dimens: ['180px', 'auto']}
      ],
      misc: [

      ]
    };

    this.state = {
      modalIsOpen: false
    };
    injectTapEventPlugin();
  }

  componentWillMount() {
    const dispatch = this.props.dispatch;
    $.getJSON('/files', (files) => {
      loadFileExplorer(dispatch, {files});
    });
  }

  handleKeyboardSave(e) {
    if (e.keyCode === 83 && e.ctrlKey) {
      e.preventDefault();
      this.modalSave();
    }
  }


  handleSnackbar() {
    console.log('Snackbar dismissed');
  }

  handlePrevNext() {
    this.backView();
    setTimeout(() => {
      const dispatch = this.props.dispatch;
      const motion = arguments[0];
      const challenges = this.props.challenges;
      const indexOfCurrentChallenge = challenges.findIndex(elem => {
        return elem.id === this.props.activeChallenge.id;
      });
      if (indexOfCurrentChallenge + motion < 0
        || indexOfCurrentChallenge + motion > challenges.length - 1) {
          return;
        }

        loadChallenge(dispatch, {
          'activeChallenge':
          this.props.challenges[indexOfCurrentChallenge + motion],
          'view': 'ChallengeEdit'
        });
      });
    }

    backView() {
      let dispatch = this.props.dispatch;
      backAction(dispatch, {
        view: 'challengeSelect'
      });
    }

    exportFiles() {
      let data = {};
      data[this.props.title] = this.props.fileStore;
      $.post('/export', {
        data,
        success: function(_data) {
          fileSaved(this.props.dispatch);
          this.refs.snackbar.show();
        }.bind(this)
      });
    }

    openModal() {
      this.setState({modalIsOpen: true});
    }

    closeModal() {
      this.setState({modalIsOpen: false});
    }

    modalSave() {
      this.closeModal();
      this.exportFiles();
    }

    handleFileSelect(to) {
      let dispatch = this.props.dispatch;
      let fileStore = this.props.fileStore;
      fileSelect(dispatch, {
        activeFile: to,
        challenges: fileStore[to].challenges
      });
    }

    handleFileIsSelected(file, title, directory) {
      let dispatch = this.props.dispatch;
      let newFileStoreObject = this.props.fileStore;
      file = JSON.parse(file);
      newFileStoreObject = file;

      newFileStoreObject.challenges = newFileStoreObject.challenges.map((challenge) => {
        return Object.assign({}, this.challengeSkeleton, challenge);
      });

      loadFile(dispatch, {
        title: `${directory}/${title}`,
        fileStore: newFileStoreObject,
        activeFile: file.name,
        challenges: newFileStoreObject.challenges,
        activeChallenge: {}
      });
    }

    handleOpenNav() {
      if (this.props.changes) {
        this.openModal();
      } else {
        this.forceOpenNav();
      }
    }

    forceOpenNav() {
      this.closeModal();
      this.refs.leftNav.refs.fileExplorer.toggle();
    }

    handleChallengeClick(id) {
      let dispatch = this.props.dispatch;

      let oldFileStore = Object.assign({}, this.props.fileStore);
      if (id === 'new') {
        $.getJSON('/mongoid', function(mongoid) {
          mongoid = mongoid.objectId;
          oldFileStore.challenges.push(Object.assign({}, this.challengeSkeleton, {
            'id': mongoid,
            'title': mongoid
          }));

          let AddedChallenge = {fileStore: oldFileStore};

          createChallenge(dispatch,
            AddedChallenge
          );
        });
      } else {
        loadChallenge(dispatch, {
          'activeChallenge':
          this.props.fileStore.challenges
          .filter((challenge) => {
            return challenge.id === id;
          }).pop(), 'view': 'ChallengeEdit'
        });
      }
    }

    handleChallengeDupe(e) {
      let dispatch = this.props.dispatch;
      let oldFileStore = Object.assign({}, this.props.fileStore);
      $.getJSON('/mongoid', function(mongoid) {
        mongoid = mongoid.objectId;
        let dupe;
        oldFileStore.challenges.map((challenge) => {
          if(challenge.id === e.target.dataset.challengid){
            dupe = Object.assign({}, challenge, {
              'id': mongoid,
              'title': challenge.title + " - Copy"
            });
          }
          return(challenge);
        });
        if(typeof dupe !== 'undefined') {
          oldFileStore.challenges.push(dupe);

          let AddedChallenge = {fileStore: oldFileStore};

          createChallenge(dispatch,
            AddedChallenge
          );
        }
      });
    }

    render() {
      let discard = (
        <RaisedButton label='Discard Changes'
          onClick={this.forceOpenNav}
          primary={true} />
      );

      let save = (
        <RaisedButton label='Save Changes'
          onClick={this.modalSave}
          secondary={true} />
      );

      // Modal.setAppElement('#modal');
      let modal = (
        <Modal
          isOpen = {this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          style = {modalStyles}
          >
          <h2>Warning:</h2>
          <p>You are attempting to load a file but you have unsaved changes.</p>
          {discard} {save}
        </Modal>
      );

      let snackBar = (
        <Snackbar
          action='OK'
          autoHideDuration={3000}
          message='File saved successfully'
          onActionTouchTap={this.handleSnackbar}
          ref='snackbar'
          />
      );

      let elements = [];
      let selectChallenges;
      if (this.props !== null && this.props.view === 'ChallengeSelect') {
        elements = [
          {
            name: 'Choose File',
            action: this.handleOpenNav.bind(this)
          }
        ];
      } else {
        elements = [
          {
            name: 'Choose File',
            action: this.handleOpenNav.bind(this)
          },
          {
            name: 'Choose Challenge',
            action: this.backView
          },
          {
            name: 'Prev',
            action: this.handlePrevNext.bind(this, -1)
          },
          {
            name: 'Next',
            action: this.handlePrevNext.bind(this, 1)
          },
          {
            name: 'Save',
            action: this.exportFiles,
            id: 'Save'
          }

        ];
      }

      if (this.props !== null
        && this.props.fileStore
        && Object.keys(this.props.fileStore).length) {
          selectChallenges = (
            <SelectChallenge
              challengeClick = {this.handleChallengeClick}
              handleChallengeDupe = {this.handleChallengeDupe}
              data = {this.props.fileStore}
              />
          );
        }

        let menu =
        <Menu elements = {elements} />;
        let leftNav = this.props.files ?
        <FileExplorer
          dispatch= {this.props.dispatch}
          files= {this.props.files}
          loadFile= {this.handleFileIsSelected}
          ref='leftNav'
          />
        : null;

        if (Object.keys(this.props.view === 'ChallengeEdit' &&
        this.props.activeChallenge).length) {
          return (
            <div onKeyDown={this.handleKeyboardSave}>
              <div id='modal'>{modal}</div>
              <div className = 'app'>
                {leftNav}
                {menu}
                <div style = {{ 'marginTop': '70px' }}>
                  <Editor editorLayout = {this.editorLayout} id={this.props.activeChallenge.id} />
                </div>
              </div>
              {snackBar}
            </div>
          );
        } else {


          return (
            <div>
              <div id='modal'>{modal}</div>
              <div className = 'app'>
                {leftNav}
                <div style = {{ 'marginTop': '70px' }}>
                  {selectChallenges}
                </div>
                {menu}
              </div>
            </div>
          );
        }
      }
    }

    export default connector(GrandCentralStation);

    GrandCentralStation.propTypes = {
      dispatch: React.PropTypes.func.isRequired,
      fileStore: React.PropTypes.object,
      activeFile: React.PropTypes.string,
      view: React.PropTypes.string.isRequired,
      activeChallenge: React.PropTypes.object,
      challenges: React.PropTypes.array,
      files: React.PropTypes.object,
      changes: React.PropTypes.bool,
      title: React.PropTypes.string
    };
