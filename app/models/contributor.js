import DS from 'ember-data';
import ShareObjectMixin from '../mixins/share-object';

export default DS.Model.extend(ShareObjectMixin, {
    person: DS.belongsTo('person'),
    creativeWork: DS.belongsTo('abstract-creative-work', { polymorphic: true }),
    url: DS.attr('string')
});
