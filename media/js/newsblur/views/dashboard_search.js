NEWSBLUR.Views.DashboardSearch = Backbone.View.extend({
    
    el: ".NB-module-search",
    
    events: {
        "keyup .NB-module-search-sites input"    : "search_sites",
        "keyup .NB-module-search-people input"   : "search_people",
        "click .NB-module-search-sites .NB-search-close" : "clear_site",
        "click .NB-module-search-people .NB-search-close" : "clear_person"
    },
    
    initialize: function() {
        this.$site = this.$(".NB-module-search-sites");
        this.$site_input = this.$(".NB-module-search-sites input");
        this.$person = this.$(".NB-module-search-people");
        this.$person_input = this.$(".NB-module-search-people input");
        this.$results = this.$(".NB-module-search-results");
        
        this.cache = {};
    },
    
    // ==========
    // = Events =
    // ==========
    
    search_sites: function() {
        var query = this.$site_input.val();
        
        if (this.cache.site_query == query) return;
        this.cache.site_query = query;
        
        if (query == "") {
            this.$site.removeClass("NB-active");
            this.$results.empty();
            return;
        } else {
            this.$site.addClass("NB-active");
        }
        
        this.$site_input.addClass('NB-active');
        this.$site.removeClass("NB-active");
        
        NEWSBLUR.assets.search_for_feeds(query, _.bind(function(data) {
            this.$site_input.removeClass('NB-active');
            this.$site.addClass("NB-active");

            if (!data || !data.feeds || !data.feeds.length) {
                this.$results.html($.make('div', { 
                    className: 'NB-friends-search-badges-empty' 
                }, [
                    $.make('div', { className: 'NB-raquo' }, '&raquo;'),
                    '抱歉，没有找到匹配 "'+query+'" 的结果。'
                ]));
                return;
            }            

            this.$results.html($.make('div', _.map(data.feeds, function(feed) {
                var model = new NEWSBLUR.Models.Feed(feed);
                return new NEWSBLUR.Views.FeedBadge({model: model});
            })));
        }, this));
    },
    
    search_people: function() {
        var query = this.$person_input.val();
        
        if (this.cache.person_query == query) return;
        this.cache.person_query = query;
        
        if (query == "") {
            this.$person.removeClass("NB-active");
            this.$results.empty();
            return;
        } else {
            this.$person.addClass("NB-active");
        }
        
        this.$person_input.addClass('NB-active');
        this.$person.removeClass("NB-active");
        
        NEWSBLUR.assets.search_for_friends(query, _.bind(function(data) {
            this.$person_input.removeClass('NB-active');
            this.$person.addClass("NB-active");
            
            if (!data || !data.profiles || !data.profiles.length) {
                this.$results.html($.make('div', { 
                    className: 'NB-friends-search-badges-empty' 
                }, [
                    $.make('div', { className: 'NB-raquo' }, '&raquo;'),
                    '抱歉，没有找到 "'+query+'" 相关的人。'
                ]));
                return;
            }
            
            this.$results.html($.make('div', _.map(data.profiles, function(profile) {
                var user = new NEWSBLUR.Models.User(profile);
                return new NEWSBLUR.Views.SocialProfileBadge({model: user});
            })));
        }, this));
    },
    
    clear_site: function() {
        this.$site_input.val('');
        this.$results.empty();
        this.$site.removeClass('NB-active');
    },
    
    clear_person: function() {
        this.$person_input.val('');
        this.$results.empty();
        this.$person.removeClass('NB-active');
    }
    
});
