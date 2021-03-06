import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import './get-status-mixin.js'
/**
 * `user-status`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class UserStatus extends PolymerElement {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>
`;
  }

  /**
   * @return {string}
   */
  static get is() {
    return 'user-status';
  }

  /**
   * connectedCallback
   */
  connectedCallback() {
    super.connectedCallback();
    this.init();
  }

  /**
   * Push presence
   *
   * @param {Object} user
   * @private
   */
  _pushPresence(user) {
    // https://firebase.google.com/docs/firestore/solutions/presence
    const userStatusDatabaseRef = firebase
      .database()
      .ref(`/user-status/${user.uid}`);

    const isOfflineForDatabase = {
      state: 'offline',
      last_changed: firebase.database.ServerValue.TIMESTAMP,
    };

    const isOnlineForDatabase = {
      state: 'online',
      last_changed: firebase.database.ServerValue.TIMESTAMP,
    };

    // Create a reference to the special ".info/connected" path in
    // Realtime Database. This path returns `true` when connected
    // and `false` when disconnected.
    this._unregisterOnConect = firebase
      .database()
      .ref('.info/connected')
      .on('value', (snapshot) => {
        // If we're not currently connected, don't do anything.
        if (snapshot && snapshot.val() === false) return;

        // If user is not currently connected, also don't do anything
        if (!firebase.auth().currentUser) return;

        // If we are currently connected, then use the 'onDisconnect()'
        // method to add a set which will only trigger once this
        // client has disconnected by closing the app,
        // losing internet, or any other means.
        return userStatusDatabaseRef
          .onDisconnect()
          .set(isOfflineForDatabase)
          .then(() => {
            // The promise returned from .onDisconnect().set() will
            // resolve as soon as the server acknowledges the onDisconnect()
            // request, NOT once we've actually disconnected:
            // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

            // We can now safely set ourselves as "online" knowing that the
            // server will mark us as offline once we lose connection.
            return userStatusDatabaseRef.set(isOnlineForDatabase);
        });
      });
  }

  /**
   * Init
   *
   * @private
   */
  init() {
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        // User just logged out.
        // If there was an onDisconect registed already, unsubscribe.
        if (this._unregisterOnConect) this._unregisterOnConect();
        // Just after user logs out, force disconection so firebase knows
        // should save 'offline' on user-status store.
        firebase.database().goOffline();
        firebase.database().goOnline();
      } else {
        // User just logged in.
        // push their presence until connection is dropped OR they log out.
        this._pushPresence(user);
      }
    });
  }
}

window.customElements.define(UserStatus.is, UserStatus);
