NEWSBLUR.ReaderProfileEditor = function(options) {
    var defaults = {
        width: 800
    };
        
    this.options = $.extend({}, defaults, options);
    this.model   = NEWSBLUR.assets;
    this.profile = this.model.user_profile;
    
    this.runner();
};

NEWSBLUR.ReaderProfileEditor.prototype = new NEWSBLUR.Modal;

_.extend(NEWSBLUR.ReaderProfileEditor.prototype, {
    
    runner: function() {
        this.options.onOpen = _.bind(function() {
            this.resize_modal();
        }, this);

        this.make_modal();
        this.open_modal();
        this.fetch_user_profile();

        this.$modal.bind('click', $.rescope(this.handle_click, this));
        this.$modal.bind('change', $.rescope(this.handle_change, this));
        this.handle_profile_counts();
        this.delegate_change();
    },
    
    make_modal: function() {
        var self = this;
        
        this.$modal = $.make('div', { className: 'NB-modal NB-modal-profile-editor' }, [
            $.make('div', { className: 'NB-modal-tabs' }, [
                $.make('div', { className: 'NB-modal-loading' }),
                $.make('div', { className: 'NB-modal-tab NB-active NB-modal-tab-profile' }, '档案'),
                $.make('div', { className: 'NB-modal-tab NB-modal-tab-blurblog' }, 'Zeitblog')
            ]),
            $.make('h2', { className: 'NB-modal-title' }, [
                $.make('div', { className: 'NB-icon' }),
                '个人档案',
                $.make('div', { className: 'NB-icon-dropdown' })
            ]),
            $.make('div', { className: 'NB-tab NB-tab-profile NB-active' }, [
                $.make('fieldset', [
                    $.make('legend', '预览'),
                    $.make('div', { className: 'NB-modal-section NB-friends-findfriends-profile' })
                ]),
                $.make('fieldset', [
                    $.make('legend', '头像'),
                    $.make('div', { className: 'NB-modal-section NB-friends-profilephoto'})
                ]),
                $.make('fieldset', [
                    $.make('legend', '详细'),
                    $.make('div', { className: 'NB-modal-section NB-friends-profile'}, [
                        $.make('form', [
                            $.make('label', '用户名'),
                            $.make('div', { className: 'NB-profile-username' }, [
                                NEWSBLUR.Globals.username,
                                $.make('a', { className: 'NB-splash-link NB-account-link', href: '#' }, '修改')
                            ]),
                            $.make('label', { 'for': 'NB-profile-location' }, '位置'),
                            $.make('input', { id: 'NB-profile-location', name: 'location', type: 'text', className: 'NB-input', style: 'width: 300px', value: this.profile.get('location'), "data-max": 40 }),
                            $.make('span', { className: 'NB-count NB-count-location' }),
                            $.make('label', { 'for': 'NB-profile-website' }, '网站'),
                            $.make('input', { id: 'NB-profile-website', name: 'website', type: 'text', className: 'NB-input', style: 'width: 410px', value: this.profile.get('website'), "data-max": 200 }),
                            $.make('span', { className: 'NB-count NB-count-website' }),
                            $.make('label', { 'for': 'NB-profile-bio' }, '个人简介'),
                            $.make('input', { id: 'NB-profile-bio', name: 'bio', type: 'text', className: 'NB-input', style: 'width: 520px', value: this.profile.get('bio'), "data-max": 160 }),
                            $.make('span', { className: 'NB-count NB-count-bio' }),
                            $.make('label', { 'for': 'NB-profile-privacy-public' }, [
                                '隐私',
                                (!NEWSBLUR.Globals.is_premium && $.make('div', { className: 'NB-profile-privacy-notpremium' }, [
                                    '必须升级到 ',
                                    $.make('div', { className: 'NB-splash-link NB-premium-link' }, '高级帐户 account'),
                                    ' 才能修改隐私选项。'
                                ]))
                            ]),
                            $.make('div', { className: 'NB-profile-privacy-options' }, [
                                $.make('div', { className: 'NB-profile-privacy-option' }, [
                                    $.make('input', { 
                                        id: 'NB-profile-privacy-public', 
                                        name: 'protected', 
                                        type: 'radio', 
                                        value: 'public', 
                                        checked: !this.profile.get('protected') &&
                                                 !this.profile.get('private'),
                                        disabled: !NEWSBLUR.Globals.is_premium
                                    }),
                                    $.make('label', { 'for': 'NB-profile-privacy-public', className: 'NB-profile-protected-label' }, [
                                        $.make('b', '公开：'),
                                        $.make('span', '我共享的文章是公开的，所有人都可以查看并回复')
                                    ])
                                ]),
                                $.make('div', { className: 'NB-profile-privacy-option' }, [
                                    $.make('input', { 
                                        id: 'NB-profile-privacy-protected', 
                                        name: 'protected', 
                                        type: 'radio', 
                                        value: 'protected', 
                                        checked: this.profile.get('protected') &&
                                                 !this.profile.get('private'),
                                        disabled: !NEWSBLUR.Globals.is_premium
                                    }),
                                    $.make('label', { 'for': 'NB-profile-privacy-protected', className: 'NB-profile-protected-label' }, [
                                        $.make('img', { src: NEWSBLUR.Globals.MEDIA_URL + 'img/icons/circular/g_icn_lock.png' }),
                                        $.make('b', '受限访问：'),
                                        $.make('span', '我共享的文章是公开的，但只有经过我允许的人才能回复')
                                    ])
                                ]),
                                $.make('div', { className: 'NB-profile-privacy-option' }, [
                                    $.make('input', { 
                                        id: 'NB-profile-privacy-private', 
                                        name: 'protected', 
                                        type: 'radio', 
                                        value: 'private', 
                                        checked: this.profile.get('protected') &&
                                                 this.profile.get('private'),
                                        disabled: !NEWSBLUR.Globals.is_premium
                                    }),
                                    $.make('label', { 'for': 'NB-profile-privacy-private', className: 'NB-profile-protected-label' }, [
                                        $.make('img', { src: NEWSBLUR.Globals.MEDIA_URL + 'img/icons/circular/g_icn_lock.png' }),
                                        $.make('b', '私有：'),
                                        $.make('span', '只有经过我允许的人才能查看和回复')
                                    ])
                                ])
                            ])
                        ])
                    ])
                ]),
                $.make('div', { className: 'NB-disabled NB-modal-submit-green NB-profile-save-button NB-modal-submit-button' }, '修改你的个人档案')
            ]),
            $.make('div', { className: 'NB-tab NB-tab-blurblog' }, [
                $.make('fieldset', [
                    $.make('legend', '你的 Zeitblog'),
                    $.make('div', { className: 'NB-modal-section NB-profile-editor-blurblog-preview' }, [
                        $.make('label', { 'for': 'NB-profile-blurblog-address' }, 'Zeitblog 地址'),
                        $.make('a', { href: this.profile.get('feed_link'), target: '_blank', className: 'NB-profile-blurblog-address NB-splash-link' }, this.profile.get('feed_link')),
                        $.make('label', { 'for': 'NB-profile-blurblog-title' }, 'Zeitblog 标题'),
                        $.make('input', { type: 'text', id: 'NB-profile-blurblog-title', name: 'blurblog_title', value: this.profile.get('feed_title'), className: 'NB-input' }),
                        $.make('label', '背景颜色'),
                        this.make_color_palette()
                    ])
                ]),
                $.make('fieldset', [
                    $.make('legend', '为你的 Zeitblog 定制 CSS'),
                    $.make('div', { className: 'NB-modal-section NB-profile-editor-blurblog-custom-css'}, [
                        $.make('textarea', { 'className': 'NB-profile-blurblog-css', name: 'css' }, this.profile.get('custom_css'))
                    ])
                ]),
                $.make('div', { className: 'NB-disabled NB-modal-submit-green NB-blurblog-save-button NB-modal-submit-button' }, '修改你的 Zeitblog 设置')
            ]),
            $.make('div', { className: 'NB-tab NB-tab-following' }),
            $.make('div', { className: 'NB-tab NB-tab-followers' })
        ]);
    },
    
    make_color_palette: function() {
        var user_profile = this.user_profile;
        var colors = [
            // ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)", "rgb(153, 153, 153)","rgb(183, 183, 183)",
            // "rgb(204, 204, 204)", "rgb(217, 217, 217)", "rgb(239, 239, 239)", "rgb(243, 243, 243)", "rgb(255, 255, 255)"],
            // ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
            // "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"], 
            ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)", 
            "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)", 
            "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)", 
            "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)", 
            "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)", 
            "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
            "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
            "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
            "rgb(133, 32, 12)", "rgb(153, 0, 0)", "rgb(180, 95, 6)", "rgb(191, 144, 0)", "rgb(56, 118, 29)",
            "rgb(19, 79, 92)", "rgb(17, 85, 204)", "rgb(11, 83, 148)", "rgb(53, 28, 117)", "rgb(116, 27, 71)",
            "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)", 
            "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
        ];
        
        var $colors = $.make('div', { className: 'NB-profile-blurblog-colors' });
        _.each(colors, function(color_line) {
            var $color_line = $.make('div', { className: 'NB-profile-blurblog-colorline' });
            _.each(color_line, function(color) {
                var $color = $.make('span', { className: 'NB-profile-blurblog-color', style: 'background-color: ' + color }).data('color', color);
                $color_line.append($color);
            });
            $colors.append($color_line);
        });
        
        return $colors;
    },
    
    choose_color: function() {
        var user_profile = this.profile;
        var $colors = $('.NB-profile-blurblog-color', this.$modal);
        
        $colors.each(function() {
            var $color = $(this);
            var color = $color.data('color');
            
            if (user_profile.get('custom_bgcolor') == color) {
                $color.addClass('NB-active');
                return false;
            }
        });
    },
    
    populate_data: function() {
        $('textarea[name=css]', this.$modal).val(this.profile.get('custom_css'));
    },
    
    make_profile_section: function() {
        var $badge = $('.NB-friends-findfriends-profile', this.$modal).empty();
        var $profile_badge;
        var profile = this.profile;
        
        $profile_badge = new NEWSBLUR.Views.SocialProfileBadge({model: profile});
        $badge.append($profile_badge);
    },
    
    make_profile_photo_chooser: function() {
        var $profiles = $('.NB-friends-profilephoto', this.$modal).empty();
        
        $profiles.append($.make('div', { className: "NB-photo-upload-error NB-error" }));
        
        _.each(['nothing', 'upload', 'twitter', 'facebook', 'gravatar'], _.bind(function(service) {
            var $profile = $.make('div', { className: 'NB-friends-profile-photo-group NB-friends-photo-'+service }, [
                $.make('div', { className: 'NB-friends-photo-title' }, [
                    $.make('input', { type: 'radio', name: 'profile_photo_service', value: service, id: 'NB-profile-photo-service-'+service }),
                    $.make('label', { 'for': 'NB-profile-photo-service-'+service }, _.string.capitalize(service))
                ]),
                $.make('div', { className: 'NB-friends-photo-image' }, [
                    $.make('label', { 'for': 'NB-profile-photo-service-'+service }, [
                        $.make('div', { className: 'NB-photo-loader' }),
                        $.make('img', { src: service == 'nothing' || !this.services[service][service+'_picture_url'] ?
                            NEWSBLUR.Globals.MEDIA_URL + 'img/reader/default_profile_photo.png' :
                            this.services[service][service+'_picture_url']
                        })
                    ])
                ]),
                (service == 'upload' && $.make('div', { className: 'NB-photo-link' }, [
                    $.make('form', { method: 'post', enctype: 'multipart/form-data', encoding: 'multipart/form-data' }, [
                        $.make('a', { href: '#', className: 'NB-photo-upload-link NB-splash-link' }, '上传图片'),
                        $.make('input', { type: 'file', name: 'photo', id: "NB-photo-upload-file", className: 'NB-photo-upload-file' })
                    ])
                ])),
                (service == 'gravatar' && $.make('div', { className: 'NB-gravatar-link' }, [
                    $.make('a', { href: 'http://www.gravatar.com', className: 'NB-splash-link', target: '_blank' }, 'gravatar.com')
                ])),
                (_.contains(['facebook', 'twitter'], service) && $.make('div', { className: 'NB-friends-link' }, [
                    $.make('div', { className: 'NB-splash-link' }, '连接')
                ]))
            ]);
            if (service == this.profile.get('photo_service') ||
                (service == 'nothing' && !this.profile.get('photo_service'))) {
                $('input[type=radio]', $profile).attr('checked', true);
            }
            $profiles.append($profile);
        }, this));
    },
    
    fetch_user_profile: function(callback) {
        $('.NB-modal-loading', this.$modal).addClass('NB-active');
        this.model.load_current_user_profile(_.bind(function(data) {
            $('.NB-modal-loading', this.$modal).removeClass('NB-active');
            this.profile = this.model.user_profile;
            this.services = data.services;
            this.make_profile_section();
            this.make_profile_photo_chooser();
            this.choose_color();
            this.populate_data();
            callback && callback();
        }, this));
    },
    
    open_modal: function(callback) {
        var self = this;
        
        this.$modal.modal({
            'minWidth': this.options.width,
            'maxWidth': this.options.width,
            'overlayClose': true,
            'onOpen': function (dialog) {
                dialog.overlay.fadeIn(200, function () {
                    dialog.container.fadeIn(200);
                    dialog.data.fadeIn(200, function() {
                        if (self.options.onOpen) {
                            self.options.onOpen();
                        }
                    });
                    setTimeout(function() {
                        $(window).resize();
                    });
                });
            },
            'onShow': function(dialog) {
                $('#simplemodal-container').corner('6px');
                if (self.options.onShow) {
                    self.options.onShow();
                }
            },
            'onClose': function(dialog, callback) {
                dialog.data.hide().empty().remove();
                dialog.container.hide().empty().remove();
                dialog.overlay.fadeOut(200, function() {
                    dialog.overlay.empty().remove();
                    $.modal.close(callback);
                });
                $('.NB-modal-holder').empty().remove();
            }
        });
    },
    
    resize_modal: function(count) {
        var $tab = $('.NB-tab.NB-active', this.$modal);
        var $modal = this.$modal;
        var $modal_container = $modal.closest('.simplemodal-container');
        
        if (count > 50) return;
        
        if ($modal.height() > $modal_container.height() - 24) {
            $tab.height($tab.height() - 5);
            this.resize_modal(count+1);
        }
        
    },
    
    switch_tab: function(newtab) {
        var $modal_tabs = $('.NB-modal-tab', this.$modal);
        var $tabs = $('.NB-tab', this.$modal);
        
        $modal_tabs.removeClass('NB-active');
        $tabs.removeClass('NB-active');
        
        $modal_tabs.filter('.NB-modal-tab-'+newtab).addClass('NB-active');
        $tabs.filter('.NB-tab-'+newtab).addClass('NB-active');
        
        this.resize_modal();
    },

    close_and_load_account: function() {
        this.close(function() {
            NEWSBLUR.reader.open_account_modal();
        });
    },

    close_and_load_friends: function() {
        this.close(function() {
            NEWSBLUR.reader.open_friends_modal();
        });
    },
    
    close_and_load_feedchooser: function() {
        this.close(function() {
            NEWSBLUR.reader.open_feedchooser_modal();
        });
    },
    
    save_profile: function() {
        var privacy_private = $('input#NB-profile-privacy-private', this.$modal).is(':checked');
        var privacy_protected = $('input#NB-profile-privacy-protected', this.$modal).is(':checked') || privacy_private;
        var data = {
            'photo_service': $('input[name=profile_photo_service]:checked', this.$modal).val(),
            'location': $('input[name=location]', this.$modal).val(),
            'website': $('input[name=website]', this.$modal).val(),
            'bio': $('input[name=bio]', this.$modal).val(),
            'protected': privacy_protected,
            'private': privacy_private
        };
        this.model.save_user_profile(data, _.bind(function(data) {
            this.animate_profile_badge();
            this.disable_save_profile();
            $('input[name=website]', this.$modal).val(this.profile.get('website'));
        }, this));
        this.disable_save_profile();
        $('.NB-profile-save-button', this.$modal).text('正在保存...');
    },
    
    save_blurblog: function() {
        var data = {
            'blurblog_title': $('input[name=blurblog_title]', this.$modal).val(),
            'custom_bgcolor': $('.NB-profile-blurblog-color.NB-active', this.$modal).data('color'),
            'custom_css': $('textarea[name=css]', this.$modal).val()
        };
        this.model.save_blurblog_settings(data, _.bind(function() {
            this.disable_save_blurblog();
        }, this));
        this.disable_save_blurblog();
        $('.NB-blurblog-save-button', this.$modal).text('正在保存...');
    },
    
    animate_profile_badge: function($badge) {
        $badge = $('table', $badge) || $('.NB-friends-findfriends-profile .NB-profile-badge table', this.$modal);
        _.delay(_.bind(function() {
            $badge.css('backgroundColor', 'white').animate({
                'backgroundColor': 'gold'
            }, {
                'queue': false,
                'duration': 600,
                'easing': 'linear',
                'complete': function() {
                    $badge.animate({
                        'backgroundColor': 'white'
                    }, {
                        'queue': false,
                        'duration': 1250,
                        'easing': 'easeOutQuad'
                    });
                }
            });
        }, this), 800);
        $badge.closest('.NB-tab').scrollTo(0, { 
            duration: 1000,
            axis: 'y', 
            easing: 'easeInOutQuint', 
            offset: 0, 
            queue: false
        });
    },
    
    set_active_color: function($color) {
        $('.NB-profile-blurblog-color.NB-active', this.$modal).removeClass('NB-active');
        $color.addClass('NB-active');
        this.enable_save_blurblog();
    },
    
    // ===========
    // = Actions =
    // ===========

    handle_click: function(elem, e) {
        var self = this;
        
        $.targetIs(e, { tagSelector: '.NB-modal-tab' }, function($t, $p) {
            e.preventDefault();
            var newtab;
            if ($t.hasClass('NB-modal-tab-profile')) {
                newtab = 'profile';
            } else if ($t.hasClass('NB-modal-tab-blurblog')) {
                newtab = 'blurblog';
            }
            self.switch_tab(newtab);
        });        
        $.targetIs(e, { tagSelector: '.NB-profile-save-button' }, function($t, $p) {
            e.preventDefault();
            
            self.save_profile();
        });
        $.targetIs(e, { tagSelector: '.NB-blurblog-save-button' }, function($t, $p) {
            e.preventDefault();
            
            self.save_blurblog();
        });
        $.targetIs(e, { tagSelector: '.NB-account-link' }, function($t, $p) {
            e.preventDefault();
            
            self.close_and_load_account();
        });
        $.targetIs(e, { tagSelector: '.NB-friends-link' }, function($t, $p) {
            e.preventDefault();
            
            self.close_and_load_friends();
        });
        $.targetIs(e, { tagSelector: '.NB-profile-blurblog-color' }, function($t, $p) {
            e.preventDefault();
            self.set_active_color($t);
        });
        $.targetIs(e, { tagSelector: '.NB-premium-link' }, function($t, $p) {
            e.preventDefault();
            self.close_and_load_feedchooser();
        });
    },
    
    handle_change: function(elem, e) {
        var self = this;
        $.targetIs(e, { tagSelector: '.NB-photo-upload-file' }, function($t, $p) {
            e.preventDefault();
            
            self.handle_photo_upload();
        });
    },
    
    handle_cancel: function() {
        var $cancel = $('.NB-modal-cancel', this.$modal);
        
        $cancel.click(function(e) {
            e.preventDefault();
            $.modal.close();
        });
    },
    
    handle_profile_counts: function() {
        var focus = function(e) {
            var $input = $(e.currentTarget);
            var $count = $input.next('.NB-count').eq(0);
            var count = parseInt($input.data('max'), 10) - $input.val().length;
            $count.text(count);
            $count.toggleClass('NB-red', count < 0);
            $count.show();
        };
        $('.NB-tab-profile', this.$modal).delegate('input[type=text]', 'focus', focus)
            .delegate('input[type=text]', 'keyup', focus)
            .delegate('input[type=text]', 'keydown', focus)
            .delegate('input[type=text]', 'change', focus)
            .delegate('input[type=text]', 'blur', function(e) {
            var $input = $(e.currentTarget);
            var $count = $input.next('.NB-count').eq(0);
            $count.hide();
        });
    },
    
    
    handle_photo_upload: function() {
        var self = this;
        var $loading = $('.NB-modal-loading', this.$modal);
        var $error = $('.NB-photo-upload-error', this.$modal);
        var $file = $('.NB-photo-upload-file', this.$modal);

        $error.slideUp(300);
        $loading.addClass('NB-active');

        var params = {
            url: NEWSBLUR.URLs['upload-avatar'],
            type: 'POST',
            dataType: 'json',
            success: _.bind(function(data, status) {
                if (data.code < 0) {
                    this.error_uploading_photo();
                } else {
                    $loading.removeClass('NB-active');
                    console.log(["success uploading", data, status, this]);
                    NEWSBLUR.assets.user_profile.set(data.user_profile);
                    this.services = data.services;
                    this.make_profile_section();
                    this.make_profile_photo_chooser();
                }
            }, this),
            error: _.bind(this.error_uploading_photo, this),
            cache: false,
            contentType: false,
            processData: false
        };
        if (window.FormData) {
            var formData = new FormData($file.closest('form')[0]);
            params['data'] = formData;
            
            $.ajax(params);
        } else {
            // IE9 has no FormData
            params['secureuri'] = false;
            params['fileElementId'] = 'NB-photo-upload-file';
            params['dataType'] = 'json';
            
            $.ajaxFileUpload(params);
        }
        
        $file.replaceWith($file.clone());
        
        return false;
    },
    
    error_uploading_photo: function() {
        var $loading = $('.NB-modal-loading', this.$modal);
        var $error = $('.NB-photo-upload-error', this.$modal);
        
        $loading.removeClass('NB-active');
        $error.text("上传图片出错。");
        $error.slideDown(300);
    },
    
    delegate_change: function() {
        $('.NB-tab-profile', this.$modal).delegate('input[type=radio],input[type=checkbox],select', 'change', _.bind(this.enable_save_profile, this));
        $('.NB-tab-profile', this.$modal).delegate('input[type=text]', 'keydown', _.bind(this.enable_save_profile, this));
        $('.NB-tab-blurblog', this.$modal).delegate('input[type=text],textarea', 'keydown', _.bind(this.enable_save_blurblog, this));
    },
    
    enable_save_profile: function() {
        $('.NB-profile-save-button', this.$modal)
            .removeClass('NB-disabled')
            .text('保存我的个人档案');
    },
    
    enable_save_blurblog: function() {
        $('.NB-blurblog-save-button', this.$modal)
            .removeClass('NB-disabled')
            .text('保存我的 Zeitblog 设置');
    },
    
    disable_save_profile: function() {
        $('.NB-profile-save-button', this.$modal)
            .addClass('NB-disabled')
            .text('修改上面的信息...');
    },
    
    disable_save_blurblog: function() {
        $('.NB-blurblog-save-button', this.$modal)
            .addClass('NB-disabled')
            .text('修改上面的信息...');
    }
    
});
