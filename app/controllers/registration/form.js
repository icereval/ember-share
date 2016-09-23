import Ember from 'ember';
import ENV from '../../config/environment';

export default Ember.Controller.extend({

    metrics: Ember.inject.service(),
    store: Ember.inject.service(),
    session: Ember.inject.service(),

    // TODO: remove when login is enabled on production
    loginEnabled: ENV.loginEnabled,

    init() {
        this._super(...arguments);
        // if (this.get('session.data.') =>
        this.getRegistrations();
        this.set('submitAgain', false);
    },

    numberOfRegistrations: 0,

    registrationsSubmitted: Ember.computed('session.data.authenticated.user', function() {
        this.getRegistrations();
    }),

    submitAgain: false,

    getRegistrations() {
        var url = ENV.apiUrl + '/registrations/';
        return Ember.$.ajax({
            url: url,
            crossDomain: true,
            type: 'GET',
            contentType: 'application/json',
        }).then((json) => {
            this.set('numberOfRegistrations', json.count);
        });
    },

    actions: {
        submit() {
            this.send('saveRegistrationModel', this.get('model'));
        },
        submitAgain() {
            this.set('submitAgain', true);
        }
    }

});
