import _ from 'lodash/lodash';
import moment from 'moment';
import Ember from 'ember';
import ApplicationController from './application';
import buildElasticCall from '../utils/build-elastic-call';
import ENV from '../config/environment';
import { getUniqueList, getSplitParams } from '../utils/elastic-query';

let filterQueryParams = ['tag', 'source', 'publisher', 'funder', 'institution', 'organization', 'language', 'contributor', 'type'];

export default ApplicationController.extend({

    queryParams:  Ember.computed(function() {
        let allParams = ['q', 'start', 'end', 'sort'];
        allParams.push(...filterQueryParams);
        return allParams;
    }),

    page: 1,
    size: 10,
    query: {},
    q: '',
    tag: '',
    source: '',
    publisher: '',
    funder: '',
    institution: '',
    organization: '',
    language: '',
    contributor: '',
    start: '',
    end: '',
    type: '',
    sort: '',

    noResultsMessage: Ember.computed('numberOfResults', function() {
        return this.get('numberOfResults') > 0 ? '' : 'No results. Try removing some filters.';
    }),

    collapsedQueryBody: true,

    results: Ember.ArrayProxy.create({content: []}),
    loading: true,
    eventsLastUpdated: Date().toString(),
    numberOfResults: 0,
    took: 0,
    numberOfSources: 0,

    sortOptions: [
        {
            display: 'relevance',
            sortBy: ''
        },
        {
            display: 'date',
            sortBy: 'date_updated'
        }
    ],

    init() {
        //TODO Sort initial results on date_modified
        this._super(...arguments);
        this.set('facetFilters', Ember.Object.create());
        // TODO Load all previous pages when hitting a page with page > 1
        // if (this.get('page') != 1) {
        //   query.from = 0;
        //   query.size = this.get('page') * this.get('size');
        // }
        this.loadEventCount();
        this.loadSourcesCount();
        this.set('debouncedLoadPage', _.debounce(this.loadPage.bind(this), 250));
    },

    loadEventCount(){
        var url = ENV.apiUrl + '/api/search/abstractcreativework/_count';
        return Ember.$.ajax({
            'url': url,
            'crossDomain': true,
            'type': 'GET',
            'contentType': 'application/json',
        }).then((json) => {
            this.set('numberOfEvents', json.count);
        });
    },

    loadSourcesCount() {
        let url = url || ENV.apiUrl + '/api/providers/';
        this.set('loading', true);
        return Ember.$.ajax({
            'url': url,
            'crossDomain': true,
            'type': 'GET',
            'contentType': 'application/json',
        }).then((json) => {
            this.set('numberOfSources', json.count);
        });
    },

    searchUrl: Ember.computed(function() {
        return buildElasticCall();
    }),

    getQueryBody() {
        let facetFilters = this.get('facetFilters');
        let filters = [];
        for (let k of Object.keys(facetFilters)) {
            let filter = facetFilters[k];
            if (filter) {
                if (Ember.$.isArray(filter)) {
                    filters = filters.concat(filter);
                } else {
                    filters.push(filter);
                }
            }
        }

        let query = {
            'query_string' : {
                'query': this.get('q') || '*'
            }
        };
        if (filters.length) {
            query = {
                'bool': {
                    'must': query,
                    'filter': filters
                }
            };
        }

        let page = this.get('page');
        let queryBody = {
            query,
            from: (page - 1) * this.get('size')
        };
        if (this.get('sort')) {
            let sortBy = {};
            sortBy[this.get('sort')] = 'desc';
            queryBody.sort = sortBy;
        }
        if (page === 1) {
            queryBody.aggregations = this.get('elasticAggregations');
        }

        this.set('displayQueryBody', { query } );
        return this.set('queryBody', queryBody);
    },

    elasticAggregations: Ember.computed(function() {
        return {
            "sources" : {
                "terms" : {
                    "field" : "source.raw",
                    "size": 200
                }
            }
        };
    }),

    loadPage() {
        let queryBody = JSON.stringify(this.getQueryBody());
        this.set('loading', true);
        return Ember.$.ajax({
            'url': this.get('searchUrl'),
            'crossDomain': true,
            'type': 'POST',
            'contentType': 'application/json',
            'data': queryBody
        }).then((json) => {
            let results = json.hits.hits.map((hit) => {
                let source = Ember.Object.create(hit._source);
                let r = source.getProperties('type', 'title', 'description', 'language', 'date', 'date_created', 'date_modified', 'date_updated', 'date_published', 'tag', 'source');
                r.id = hit._id;
                r.contributors = source.lists.contributors;
                r.funders = source.lists.funders;
                r.publishers = source.lists.publishers;
                r.institutions = source.lists.institutions;
                r.organizations = source.lists.organizations;
                return r;
            });
            if (json.aggregations) {
                this.set('aggregations', json.aggregations);
            }
            this.set('numberOfResults', json.hits.total);
            this.set('took', moment.duration(json.took).asSeconds());
            this.set('loading', false);
            this.get('results').addObjects(results);
        });
    },

    search() {
        this.set('page', 1);
        this.set('loading', true);
        this.get('results').clear();
        this.get('debouncedLoadPage')();
    },

    facets: Ember.computed(function() {
        return [
            { key: 'source', title: 'Source', component: 'search-facet-source' },
            { key: 'date', title: 'Date', component: 'search-facet-daterange' },
            { key: 'type', title: 'Type', component: 'search-facet-worktype' },
            { key: 'tag', title: 'Subject/Tag', component: 'search-facet-typeahead' },
            { key: 'publisher', title: 'Publisher', component: 'search-facet-typeahead' },
            { key: 'funder', title: 'Funder', component: 'search-facet-typeahead' },
            { key: 'institution', title: 'Institution', component: 'search-facet-typeahead' },
            { key: 'organization', title: 'Organization', component: 'search-facet-typeahead' },
            { key: 'language', title: 'Language', component: 'search-facet-language' },
            { key: 'contributor', title: 'People', component: 'search-facet-typeahead', type: 'person' },
        ];
    }),

    facetStates: Ember.computed(...filterQueryParams, 'end', 'start', function() {
        let facetStates = {};
        for (let param of filterQueryParams) {
            facetStates[param] = getSplitParams(this.get(param));
        }
        facetStates['date'] = {start: this.get('start'), end: this.get('end')};
        return facetStates;
    }),

    atomFeedUrl: Ember.computed('queryBody', function() {
        let query = this.get('queryBody.query');
        let encodedQuery = encodeURIComponent(JSON.stringify(query));
        return `${ENV.apiUrl}/api/atom/?elasticQuery=${encodedQuery}`;
    }),

    actions: {

        addFilter(type, filterValue) {
            let currentValue = getSplitParams(this.get(type));
            currentValue = currentValue ? currentValue : [];
            let newValue = getUniqueList([filterValue].concat(currentValue));
            this.set(type, newValue);
        },

        toggleCollapsedQueryBody() {
            this.toggleProperty('collapsedQueryBody');
        },

        typing(val, event) {
            // Ignore all keycodes that do not result in the value changing
            // 8 == Backspace, 32 == Space
            if (event.keyCode < 49 && !(event.keyCode === 8 || event.keyCode === 32)) {
                return;
            }
            this.search();
        },

        search() {
            this.search();
        },

        updateParams(key, value) {
            if (key === 'date') {
                this.set('start', value.start);
                this.set('end', value.end);
            } else {
                value = value ? value : '';
                this.set(key, value);
            }
        },

        filtersChanged() {
            this.search();
        },

        next() {
            // If we don't have full pages then we've hit the end of our search
            if (this.get('results.length') % this.get('size') !== 0) {
                return;
            }
            this.incrementProperty('page', 1);
            this.loadPage();
        },

        prev() {
            // No negative pages
            if (this.get('page') < 1) {
                return;
            }
            this.decrementProperty('page', 1);
            this.loadPage();
        },

        selectSortOption(option) {
            this.set('sort', option);
            this.search();
        },

        clearFilters() {
            this.set('facetFilters', Ember.Object.create());
            for (var param in filterQueryParams) {
                let key = filterQueryParams[param];
                if (filterQueryParams.indexOf(key) > -1) {
                    this.set(key, '');
                }
            }
            this.set('start', '');
            this.set('end', '');
            this.set('sort', '');
            this.search();
        }
    }
});
