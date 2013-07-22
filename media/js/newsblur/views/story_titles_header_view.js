NEWSBLUR.Views.StoryTitlesHeader = Backbone.View.extend({
    
    options: {
        'layout': 'split'
    },
    
    events: {
        "click .NB-feedbar-options"         : "open_options_popover",
        "click .NB-story-title-indicator"   : "show_hidden_story_titles"
    },
    
    initialize: function() {
        this.$story_titles_feedbar = $(".NB-story-titles-header");
        this.$feed_view_feedbar = $(".NB-feed-story-view-header");
        
        
        this.showing_fake_folder = NEWSBLUR.reader.flags['river_view'] && 
            NEWSBLUR.reader.active_folder && 
            (NEWSBLUR.reader.active_folder.get('fake') || !NEWSBLUR.reader.active_folder.get('folder_title'));
        if (this.options.layout == 'split' || this.options.layout == 'list') {
            this.$story_titles_feedbar.show();
            this.$feed_view_feedbar.hide();
            this.setElement(this.$story_titles_feedbar);
        } else if (this.options.layout == 'full') {
            this.$story_titles_feedbar.hide();
            this.$feed_view_feedbar.show();
            this.setElement(this.$feed_view_feedbar);
        }
    },
    
    render: function() {
        var $view;
        
        if (NEWSBLUR.reader.active_feed == 'starred') {
            $view = $(_.template('\
                <div class="NB-folder NB-no-hover">\
                    <div class="NB-starred-icon"></div>\
                    <div class="NB-feedlist-manage-icon"></div>\
                    <div class="folder_title_text">Saved Stories</div>\
                </div>\
            ', {}));
            this.view = new NEWSBLUR.Views.FeedSearchView({
                feedbar_view: this
            }).render();
            $view.append(this.view.$el);
        } else if (this.showing_fake_folder) {
            $view = $(_.template('\
                <div class="NB-folder NB-no-hover">\
                    <div class="NB-story-title-indicator">\
                        <div class="NB-story-title-indicator-count"></div>\
                        <span class="NB-story-title-indicator-text">show hidden stories</span>\
                    </div>\
                    <div class="NB-folder-icon"></div>\
                    <div class="NB-feedlist-manage-icon"></div>\
                    <span class="folder_title_text"><%= folder_title %></span>\
                    <% if (show_options) { %>\
                        <div class="NB-feedbar-options-container">\
                            <span class="NB-feedbar-options">\
                                <div class="NB-icon"></div>\
                                <%= read_filter %>\
                                &middot;\
                                <%= order %>\
                            </span>\
                        </div>\
                    <% } %>\
                </div>\
            ', {
                folder_title: this.fake_folder_title(),
                folder_id: NEWSBLUR.reader.active_feed,
                read_filter : NEWSBLUR.assets.view_setting(NEWSBLUR.reader.active_feed, "read_filter") == "all" ? "全部" : "未读",
                order       : NEWSBLUR.assets.view_setting(NEWSBLUR.reader.active_feed, "order") == "oldest" ? "最旧" : "最新",
                show_options: !NEWSBLUR.reader.active_folder.get('fake')
            }));
        } else if (NEWSBLUR.reader.flags['river_view'] && 
                   NEWSBLUR.reader.active_folder &&
                   NEWSBLUR.reader.active_folder.get('folder_title')) {
            this.view = new NEWSBLUR.Views.Folder({
                model: NEWSBLUR.reader.active_folder,
                collection: NEWSBLUR.reader.active_folder.folder_view.collection,
                feedbar: true,
                only_title: true
            }).render();    
            $view = this.view.$el;    
        } else {
            this.view = new NEWSBLUR.Views.FeedTitleView({
                model: NEWSBLUR.assets.get_feed(this.options.feed_id), 
                type: 'story'
            }).render();
            $view = this.view.$el;
        }

        this.$el.html($view);
        this.setElement($view);            
        this.show_feed_hidden_story_title_indicator();
        
        return this;
    },
    
    fake_folder_title: function() {
        var title = "所有站点的文章";
        if (NEWSBLUR.reader.flags['social_view']) {
            if (NEWSBLUR.reader.flags['global_blurblogs']) {
                title = "全局分享的文章";
            } else {
                title = "我关注的分享";
            }
        }
        
        return title;
    },
    
    remove: function() {
        if (this.view) {
            this.view.remove();
        }
        Backbone.View.prototype.remove.call(this);
    },
    
    // ===========
    // = Actions =
    // ===========
    
    show_feed_hidden_story_title_indicator: function(is_feed_load) {
        if (!is_feed_load) return;
        if (!NEWSBLUR.reader.active_feed) return;
        NEWSBLUR.reader.flags['unread_threshold_temporarily'] = null;
        
        var unread_view_name = NEWSBLUR.reader.get_unread_view_name();
        var $indicator = this.$('.NB-story-title-indicator');
        var unread_hidden_stories;
        if (NEWSBLUR.reader.flags['river_view']) {
            unread_hidden_stories = NEWSBLUR.reader.active_folder.folders &&
                                    NEWSBLUR.reader.active_folder.folders.unread_counts &&
                                    NEWSBLUR.reader.active_folder.folders.unread_counts().ng;
        } else {
            unread_hidden_stories = NEWSBLUR.assets.active_feed.unread_counts().ng;
        }
        var hidden_stories = unread_hidden_stories || !!NEWSBLUR.assets.stories.hidden().length;
        if (!hidden_stories) {
            $indicator.hide();
            return;
        }
        
        if (is_feed_load) {
            $indicator.css({'display': 'block', 'opacity': 0});
            _.delay(function() {
                $indicator.animate({'opacity': 1}, {'duration': 1000, 'easing': 'easeOutCubic'});
            }, 500);
        }
        $indicator.removeClass('unread_threshold_positive')
                  .removeClass('unread_threshold_neutral')
                  .removeClass('unread_threshold_negative')
                  .addClass('unread_threshold_'+unread_view_name);
    },
    
    show_hidden_story_titles: function() {
        var $indicator = this.$('.NB-story-title-indicator');
        var unread_view_name = NEWSBLUR.reader.get_unread_view_name();
        var hidden_stories_at_threshold = NEWSBLUR.assets.stories.any(function(story) {
            var score = story.score();
            if (unread_view_name == 'positive') return score == 0;
            else if (unread_view_name == 'neutral') return score < 0;
        });
        var hidden_stories_below_threshold = unread_view_name == 'positive' && 
                                             NEWSBLUR.assets.stories.any(function(story) {
            return story.score() < 0;
        });
        
        // NEWSBLUR.log(['show_hidden_story_titles', hidden_stories_at_threshold, hidden_stories_below_threshold, unread_view_name]);
        
        // First click, open neutral. Second click, open negative.
        if (unread_view_name == 'positive' && 
            hidden_stories_at_threshold && 
            hidden_stories_below_threshold) {
            NEWSBLUR.reader.flags['unread_threshold_temporarily'] = 'neutral';
            NEWSBLUR.reader.show_story_titles_above_intelligence_level({
                'unread_view_name': 'neutral',
                'animate': true,
                'follow': true
            });
            $indicator.removeClass('unread_threshold_positive').addClass('unread_threshold_neutral');
        } else {
            NEWSBLUR.reader.flags['unread_threshold_temporarily'] = 'negative';
            NEWSBLUR.reader.show_story_titles_above_intelligence_level({
                'unread_view_name': 'negative',
                'animate': true,
                'follow': true
            });
            $indicator.removeClass('unread_threshold_positive')
                      .removeClass('unread_threshold_neutral')
                      .addClass('unread_threshold_negative');
            $indicator.animate({'opacity': 0}, {'duration': 500}).css('display', 'none');
        }
    },
    
    open_options_popover: function() {
        if (!this.showing_fake_folder) return;
        
        NEWSBLUR.FeedOptionsPopover.create({
            anchor: this.$(".NB-feedbar-options"),
            feed_id: NEWSBLUR.reader.active_feed
        });
    }

    
});