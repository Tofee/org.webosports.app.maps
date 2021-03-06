(function (enyo, scope) {
	/**
	* {@link enyo.SpriteAnimation} is a basic animation [component]{@link enyo.Component}.
	* Call `play()` to start the animation. The animation will run for the period
	* of time (in milliseconds) specified by its [duration]{@link enyo.SpriteAnimation#duration}.
	*
	* @class enyo.SpriteAnimation
	* @extends enyo.Control
	* @ui
	* @public
	*/
	enyo.kind(
		/** @lends enyo.SpriteAnimation.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.SpriteAnimation',

		/**
		* @private
		*/
		kind: 'enyo.Control',

		/**
		* @private
		*/
		classes: 'enyo-sprite-animation',

		/**
		* @private
		*/
		published:
			/** @lends enyo.SpriteAnimation.prototype */ {

			/**
			* Default value used if the animation has no
			* [duration]{@link enyo.SpriteAnimation#duration} specified.
			*
			* @type {String}
			* @default ''false''
			* @public
			*/
			src: '',

			/**
			* The number of milliseconds the animation will run.
			*
			* @type {Number}
			* @default 5000
			* @public
			*/
			duration: 5000,

			/**
			* The width of a single sprite-cell image.
			*
			* @type {Number}
			* @default 100
			* @public
			*/
			width: 100,

			/**
			* The height of a single sprite-cell image.
			*
			* @type {Number}
			* @default 100
			* @public
			*/
			height: 100,

			/**
			* The number of rows of sprite-cells.
			*
			* @type {Number}
			* @default 1
			* @public
			*/
			rows: 1,

			/**
			* The number of columns of sprite-cells.
			*
			* @type {Number}
			* @default 2
			* @public
			*/
			columns: 2,

			/**
			* Accepts any valid CSS animation-iteration-count value. Default is null, which implies
			* infinite iterations.
			*
			* @type {Number|String}
			* @default null
			* @public
			*/
			iterationCount: null,

			/**
			* Indicates whether the cells are laid out horizontally or vertically. For example:
			* ```
			* Horizontal:
			*	[1][2]
			*	[3][4]
			* Vertical:
			*	[1][3]
			*	[2][4]
			* ```
			*
			* @type {String}
			* @default 'horizontal'
			* @public
			*/
			cellOrientation: 'horizontal',

			/**
			* Applies an offset to the coordinates of the first sprite. Normally this may be left
			* at `0`, but if you have multiple sprites in a single image file, or there's padding
			* around your image, specify the offset in pixels.
			*
			* @type {Number}
			* @default 0
			* @public
			*/
			offsetTop: 0,

			/**
			* Applies an offset to the coordinates of the first sprite. Normally this may be left
			* at `0`, but if you have multiple sprites in a single image file, or there's padding
			* around your image, specify the offset in pixels.
			*
			* @type {Number}
			* @default 0
			* @public
			*/
			offsetLeft: 0,

			/**
			* Boolean property to get or set the `paused`-state of this animation. This is bindable.
			* There's also a [pause()]{@linkcode enyo.SpriteAnimation#pause} method for convenience.
			*
			* @type {Boolean}
			* @default false
			* @public
			*/
			paused: false,

			/**
			* When an animation should run a finite number of times (set
			* [iterationCount]{@link enyo.SpriteAnimation#iterationCount}), and stop at the last
			* frame when it's finished: set this to `true` (default). Setting this to `false` will
			* reset the animation back to the starting frame when the iterations complete. This
			* property has no effect on infinitely iterating animations.
			*
			* @type {Boolean}
			* @default true
			* @public
			*/
			stopAtEnd: true
		},

		/**
		* @private
		*/
		components: [
			{kind: 'enyo.Image', name: 'spriteImage', classes: 'enyo-sprite-animation-image', mixins: ['enyo.StylesheetSupport'], sizing: 'cover'}
		],

		/**
		* @private
		*/
		bindings: [
			{from: '.src', to: '.$.spriteImage.src'}
		],

		/**
		* @private
		*/
		computed: {
			'animationName': ['id'],
			'totalWidth': ['offsetLeft', 'width', 'columns'],
			'totalHeight': ['offsetTop', 'height', 'rows'],
			'steps': ['cellOrientation', 'columns', 'rows']
		},

		/**
		* @private
		*/
		observers: {
			setSize: ['width', 'height', 'totalWidth', 'totalHeight'],
			setOffset: ['offsetTop', 'offsetLeft'],
			_applyAnimation: ['iterationCount', 'cellOrientation', 'columns', 'rows', 'id'],
			updateKeyframes: ['cellOrientation', 'width', 'height', 'totalWidth', 'totalHeight', 'columns', 'rows', 'offsetTop', 'offsetLeft']
		},

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);

				this.setOffset();
				this.setSize();
				this.pausedChanged();
				this.stopAtEndChanged();
				this.updateKeyframes();
				this._applyAnimation();
			};
		}),

		/**
		* @private
		*/
		durationChanged: function () {
			this.$.spriteImage.applyStyle('-webkit-animation-duration', (this.get('duration') / 1000) + 's');
			this.$.spriteImage.applyStyle('animation-duration', (this.get('duration') / 1000) + 's');
			this._forceAnimationReset();
		},

		/**
		* @private
		*/
		setSize: function () {
			this.applyStyle('width', this.get('width') + 'px');
			this.applyStyle('height', this.get('height') + 'px');

			this.$.spriteImage.applyStyle('width', this.get('totalWidth') + 'px');
			this.$.spriteImage.applyStyle('height', this.get('totalHeight') + 'px');
		},

		/**
		* @private
		*/
		setOffset: function () {
			this.$.spriteImage.applyStyle('background-position', (this.get('offsetLeft') * -1) + 'px ' + (this.get('offsetTop') * -1) + 'px');
		},

		/**
		* @private
		*/
		updateKeyframes: function () {
			this.$.spriteImage.set('stylesheetContent', this._generateKeyframes());
			this._forceAnimationReset();
		},

		/**
		* @private
		*/
		animationName: function () {
			return this.get('id') + '_keyframes';
		},

		/**
		* @private
		*/
		totalWidth: function () {
			return this.get('offsetLeft') + this.get('width') * this.get('columns');
		},

		/**
		* @private
		*/
		totalHeight: function () {
			return this.get('offsetTop') + this.get('height') * this.get('rows');
		},

		/**
		* Retrieves the amount of steps each row or column has.
		*
		* @returns {Number} The amount of rows or columns the animation will step through.
		* @private
		*/
		steps: function () {
			return (this.get('cellOrientation') == 'horizontal') ? this.get('columns') : this.get('rows');
		},

		/**
		* Starts the animation.
		*
		* @public
		*/
		start: function () {
			this.$.spriteImage.applyStyle('-webkit-animation-name', this.get('animationName'));
			this.$.spriteImage.applyStyle('animation-name', this.get('animationName'));
			this.set('paused', false);
		},

		/**
		* Stops (and resets) the animation.
		*
		* @public
		*/
		stop: function () {
			this.$.spriteImage.applyStyle('-webkit-animation-name', null);
			this.$.spriteImage.applyStyle('animation-name', null);
		},

		/**
		* @private
		*/
		stopAtEndChanged: function() {
			this.$.spriteImage.applyStyle('-webkit-animation-fill-mode', this.get('stopAtEnd') ? 'forwards' : null);
			this.$.spriteImage.applyStyle('animation-fill-mode', this.get('stopAtEnd') ? 'forwards' : null);
		},

		/**
		* Links the pause property to the [pause]{@link enyo.SpriteAnimation#pause} method.
		*
		* @private
		*/
		pausedChanged: function() {
			this.addRemoveClass('paused', this.get('paused'));
		},

		/**
		* Pauses the animation. Starting the animation after running this will resume it from where
		* it left off (or paused at).
		*
		* @public
		*/
		pause: function () {
			this.set('paused', true);
		},

		/**
		* @private
		*/
		_forceAnimationReset: function () {
			this.stop();
			this.startJob('forceAnimationReset', function() {
				this.start();
			}, 100);	// This long delay is needed to force webkit to un-set and re-set the animation.
		},

		/**
		* @private
		*/
		_applyAnimation: function () {
			var steps = this.get('steps'),
				iterations = this.get('iterationCount');

			iterations = (iterations && iterations !== 0) ? iterations : 'infinite';
			this.$.spriteImage.applyStyle('-webkit-animation-timing-function', 'steps(' + steps + ', start)');
			this.$.spriteImage.applyStyle('animation-timing-function', 'steps(' + steps + ', start)');
			this.$.spriteImage.applyStyle('-webkit-animation-iteration-count', iterations);
			this.$.spriteImage.applyStyle('animation-iteration-count', iterations);
			this.durationChanged();
		},

		/**
		* @private
		*/
		_generateKeyframes: function () {
			var o,
				width = this.get('width'),
				height = this.get('height'),
				rows = this.get('rows'),
				cols = this.get('columns'),
				horiz = this.get('cellOrientation') == 'horizontal' ? true : false,
				kfStr = '',
				outer = (horiz ? rows : cols);

			kfStr += '@-webkit-keyframes '+ this.get('animationName') +' {\n';
			for (o = 0; o < outer; o++) {
				kfStr += this._generateKeyframe(
					// percent
					((o / outer) ? ((o / outer) + 0.0001) : 0),
					// startX
					horiz ? width : (-width * o),
					// startY
					horiz ? (-height * o) : height
				);
				kfStr += this._generateKeyframe(
					// percent
					((o+1) / outer),
					// endX
					horiz ? ((-width * cols) + width) : (-width * o),
					// endY
					horiz ? (-height * o) : ((-height * rows) + height)
				);
			}
			kfStr += '}\n';
			return kfStr;
		},

		/**
		* @private
		*/
		_generateKeyframe: function (percent, x, y) {
			return (parseInt(percent*10000, 10) / 100) +'%	{ -webkit-transform: translate3d('+ x +'px, '+ y +'px, 0);	transform: translate3d('+ x +'px, '+ y +'px, 0); }\n';
		}
	});

})(enyo, this);
