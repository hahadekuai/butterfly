/**
 * ��ҳ��
 * @author qijun.weiqj
 */
define('ui.Paging', ['jQuery', 'Class'], function($, Class) {

'use strict';

return Class({

	/**
	 * @ctor
	 * @param {jQuery} div �ڵ�
	 * @param {object} options
	 *	- render {boolean|number}	�Ƿ���js��Ⱦ��ҳ����Ĭ��Ϊfalse
	 *	- listSize: {number}	��ҳ����ҳ������, Ĭ��Ϊ7
	 *	- showForm {boolean}	�Ƿ���ʾ��ҳ��, Ĭ��Ϊfalse
	 *	- showPrevNext {boolean} �Ƿ���ʾ��һҳ����һҳ
	 *	- pageIndex {number}	��ǰҳ>=1��Ĭ�ϴӽڵ��Ƶ�
	 *	- pageCount {number}	ҳ������ -1 ��ʾδ֪ҳ��
	 *							
	 *	- goTo {function(page)}
	 */
	init: function(div, options) {
		this.element = $(div).eq(0);
		if (!this.element.length) {
			throw 'empty node for paging';
			return;
		}

		this.options = options || {};
		
		this._init();
		this._render();
		this._handle();
	},

	_init: function() {
		var opts = this.options,
			page = opts.pageIndex;	
		
		// ��ʼpageIndex���û�����ã��ڷ���Ⱦ״̬�¿��ɽڵ��Ƶ� 
		// ����Ĭ��Ϊ1 
		page = !page && !opts.render ?  
				$('a.current', this.element).data('page') : page;

		this.pageIndex = page || 1;
		this.pageCount = opts.pageCount;
	},

	_render: function(page) {
		var opts = this.options;
		if (!opts.render) {
			return;
		}

		this.pageIndex = page || this.pageIndex;
		
		if (!this._rendered) {
			this.element.html(this._tpl);
			if (!opts.renderForm) {
				$('div.paging-form', this.element).remove();
			} else if (this.pageCount === -1) {
				$('span.page-count', this.element).remove();
			}
			this._rendered = true;
		}

		$('em.pagenum', this.element).html(this.pageCount);
		this._renderList();
	},

	_renderList: function() {
		var html = [],
			tpl = '<li><a href="{link}" data-page="{page}" class="{class}">${text}</a></li>',
			pageIndex = this.pageIndex,
			pageCount = this.pageCount || 1,
			showPrev = this.options.showPrevNext,
		
			size = parseInt(this.options.listSize, 10) || 7,
			from = pageIndex - Math.floor((size - 4) / 2),
			to,
			now;

		if (pageCount === -1) {
			pageCount = Number.MAX_VALUE;
		}
		if (showPrev === undefined) {
			showPrev = true;
		}

		// ������ȥͷβ4��ҳ����м�ҳ��
		if (from + size - 2 > pageCount) {
			from = pageCount - size + 3;
		} 

		from < 3 && (from = 3);	// ���ٴӵ�3ҳ��ʼ
		to = from;
		for (var i = 0; i < size - 4; i++) {
			if (to > pageCount - 2) {
				break;
			}
			html.push(this._createItem(to, to, '', true));
			to++;
		}
		to--;

		// ����ҳ��2
		if (pageCount > 1) {
			now = Math.floor((from + 1) / 2);
			var item = from > now + 1 ? this._createItem('...', now, 'omit') :
					this._createItem(now, now, '', true);
			html.unshift(item); 
		}

		// ����ҳ��1
		if (pageCount !== 0) {
			html.unshift(this._createItem(1, 1, '', true));
		}

		// ��һҳ
		if (showPrev) {
			html.unshift(this._createItem('��һҳ', pageIndex - 1, pageIndex === 1 ? 'pre pre-disabled' : 'pre'));
		}

		// ��������2��ҳ��
		if (pageCount > 2) {
			now = this.pageCount === -1 ? to + 10 : Math.floor((pageCount + to + 1) / 2);
			var item = to < now - 1 ? this._createItem('...', now, 'omit') :
					this._createItem(now, now, '', true);
			html.push(item);
		}

		// �������1��ҳ��
		if (this.pageCount !== -1 && pageCount > 3) {
			html.push(this._createItem(pageCount, pageCount, '', true));
		}

		// ������һҳ
		if (showPrev) {
			html.push(this._createItem('��һҳ', pageIndex + 1, pageIndex === pageCount ? 'next next-disabled' : 'next'));
		}
		
		$('ul.paging-list', this.element).html(html.join(''));
	},

	_createItem: function(text, page, className, current) {
		var tpl = '<li><a href="{link}" data-page="{page}" class="{className}">{text}</a></li>';
		if (current && page === this.pageIndex) {
			className += ' current';
		}

		return $.util.substitute(tpl, {
			link: 'page/' + page,
			page: page,
			className: className,
			text: text
		});
	},

	_handle: function() {
		this._handlePaging();
		this._handlePnum();
	},

	/**
	 * �����ҳ�¼�
	 */
	_handlePaging: function() {
		var self = this,
			opts = this.options;

		this.element.on('click', 'ul.paging-list a', function(e) {
			var elm = $(this);
			// ��Чҳ
			if (elm.hasClass('current') || 
					elm.hasClass('pre-disabled') || elm.hasClass('next-disabled')) {
				e.preventDefault();
				return;
			}

			// û�ṩgoTo����������ת
			if (!opts.goTo) {
				return;
			}

			e.preventDefault();
			var page = elm.data('page');
			if (opts.goTo(page) !== false) {
				self._render(page);
			}
		});

		this.element.on('click', 'a.paging-btn', function(e) {
			e.preventDefault();	
			var page = $('input.pnum', self.element).val();
			self.goTo(page);
		});
	},

	goTo: function(page) {
		page = parseInt(page, 10);

		if (!this._validate(page)) {
			return;
		}

		var opts = this.options;
		if (!opts.goTo) {
			return this._goTo(page);
		}

		if (opts.goTo(page) !== false) {
			this._render(page);
		}
	},

	_validate: function(page) {
		var pageCount = this.pageCount;
		return pageCount === -1 || page > 0 && page <= pageCount;
	},

	_goTo: function(page) {
		var url = this.element.data('url');
		if (url) {
			window.location = url.replace('{page}', page);
		}
	},

	_handlePnum: function() {
		var input = $('input.pnum', this.element);
		if (!input.length) {
			return;
		}

		input.on('input propertychange blur', function() {
			var last = input.data('lastValue'),
				value = input.val();
			if (!value || /^[1-9]\d*$/.test(value)) {
				input.data('lastValue', value);
			} else {
				setTimeout(function() {
					input.val(last);
				}, 50);
			}
		});

	},

	_tpl: [
		'<div class="paging">',
			'<ul class="paging-list fd-clr"></ul>',
			'<div class="paging-form fd-clr">',
				'<span class="page-count">��<em class="pagenum"></em>ҳ</span>',
				'<span>��<input type="text" class="ui-txt ui-txt-small pnum" autocomplete="off" maxlength="4">ҳ</span>',
				'<a title="ȷ��" href="#" class="paging-btn">ȷ ��</a>',
			'</div>',
		'</div>'
		].join('')

});
//~
	
		
});
