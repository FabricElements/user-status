window.Fabric = window.Fabric || {};
/**
 * Fabric.GetStatus
 *
 * @polymerMixin Fabric.GetStatus
 * @memberOf Fabric
 * @constructor
 * @summary Custom element base class that provides the core API for
 * @property {boolean} google
 * @param {Function} baseClass
 */
Fabric.GetStatus = (baseClass) => {
  return class extends baseClass {
    /**
     * @return {object}
     */
    static get properties() {
      return {
        status: {
          type: Boolean,
          value: false,
          notify: true,
          reflectToAttribute: true,
        },
      };
    }

    /**
     * Get status
     *
     * @param {string} uid
     * @private
     */
    _getStatus(uid) {
      const userStatusDatabaseRef = firebase.database()
        .ref(`/user-status/${uid}`);
      userStatusDatabaseRef.on('value', (snapshot) => {
        const value = snapshot.val();
        return this.status = value && value.state === 'online'
          ? true
          : false;
      });
    }
  };
};
