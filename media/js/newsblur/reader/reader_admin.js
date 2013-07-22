NEWSBLUR.ReaderUserAdmin = function(options) {
    var defaults = {};
    
    this.options = $.extend({}, defaults, options);
    this.model = NEWSBLUR.assets;
    this.user = this.options.user;
    this.runner();
};

NEWSBLUR.ReaderUserAdmin.prototype = new NEWSBLUR.Modal;
NEWSBLUR.ReaderUserAdmin.prototype.constructor = NEWSBLUR.ReaderUserAdmin;

_.extend(NEWSBLUR.ReaderUserAdmin.prototype, {
    
    runner: function() {
        this.make_modal();
        this.open_modal();
        this.fetch_payment_history();
        
        
        this.$modal.bind('click', $.rescope(this.handle_click, this));
    },
    
    make_modal: function() {
        var self = this;
        
        this.$modal = $.make('div', { className: 'NB-modal-admin NB-modal' }, [
            $.make('h2', { className: 'NB-modal-title' }, [
                $.make('div', { className: 'NB-icon' }),
                '用户管理'
            ]),
            new NEWSBLUR.Views.SocialProfileBadge({
                model: this.user
            }),
            $.make('fieldset', [
                $.make('legend', '付款')
            ]),
            $.make('ul', { className: 'NB-account-payments' }, [
                $.make('li', { className: 'NB-payments-loading' }, '正在载入...')
            ]),
            $.make('fieldset', [
                $.make('legend', '动作')
            ]),
            $.make('div', { className: 'NB-admin-actions' }, [
            ])
        ]);
    },
    
    // ============
    // = Payments =
    // ============

    fetch_payment_history: function() {
        this.model.fetch_payment_history(this.user.get('user_id'), _.bind(function(data) {
            var $history = $('.NB-account-payments', this.$modal).empty();
            var $actions = $(".NB-admin-actions", this.$modal).empty();
            
            _.each(data.payments, function(payment) {
                $history.append($.make('li', { className: 'NB-account-payment' }, [
                    $.make('div', { className: 'NB-account-payment-date' }, payment.payment_date),
                    $.make('div', { className: 'NB-account-payment-amount' }, "$" + payment.payment_amount),
                    $.make('div', { className: 'NB-account-payment-provider' }, payment.payment_provider)
                ]));
            });
            if (!data.payments.length) {
                $history.append($.make('i', '无付款记录。'));
            }
            
            if (data.is_premium) {
                $actions.append($.make('div', { style: 'margin-bottom: 12px' }, [
                    "用户是付费用户，期限是： ",
                    (data.premium_expire || $.make('b', '无期限'))
                ]));
                $actions.append($.make('div', { className: "NB-modal-submit-button NB-modal-submit-green NB-admin-action-refund", style: "float: left" }, "Full Refund"));
                $actions.append($.make('div', { className: "NB-modal-submit-button NB-modal-submit-green NB-admin-action-refund-partial", style: "float: left" }, "Refund $12"));
            } else {
                $actions.append($.make('div', { className: "NB-modal-submit-button NB-modal-submit-green NB-admin-action-upgrade" }, "升级至高级帐户"));
            }
            $(window).resize();
        }, this));
    },
    
    // ===========
    // = Actions =
    // ===========

    handle_click: function(elem, e) {
        var self = this;
        
        $.targetIs(e, { tagSelector: '.NB-admin-action-refund' }, function($t, $p) {
            e.preventDefault();
            
            NEWSBLUR.assets.refund_premium({
                'user_id': self.user.get('user_id')
            }, function(data) {
                $(".NB-admin-action-refund").replaceWith($.make('div', 'Refunded $' + data.refunded));
            }, function(data) {
                $(".NB-admin-action-refund").replaceWith($.make('div', 'Error: ' + JSON.stringify(data)));
            });
        });
        $.targetIs(e, { tagSelector: '.NB-admin-action-refund-partial' }, function($t, $p) {
            e.preventDefault();
            
            NEWSBLUR.assets.refund_premium({
                'user_id': self.user.get('user_id'),
                'partial': true
            }, function(data) {
                $(".NB-admin-action-refund").replaceWith($.make('div', 'Refunded $' + data.refunded));
            }, function(data) {
                $(".NB-admin-action-refund").replaceWith($.make('div', 'Error: ' + JSON.stringify(data)));
            });
        });
        $.targetIs(e, { tagSelector: '.NB-admin-action-upgrade' }, function($t, $p) {
            e.preventDefault();
            
            NEWSBLUR.assets.upgrade_premium(self.user.get('user_id'), function() {
                $(".NB-admin-action-upgrade").replaceWith($.make('div', '已升级！'));
                self.fetch_payment_history();
            }, function(data) {
                $(".NB-admin-action-upgrade").replaceWith($.make('div', '错误：' + JSON.stringify(data)));
            });
        });

    }
    
});
