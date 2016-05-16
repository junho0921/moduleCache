define(function(require, exports, module){

	var Router = require("./nuui-router");

	var ModuleLoader = module.exports = Router.extend({
		initialize:function(){
			this.moduleStates = {};

			this.route(":dir/:file/*func", "handle");

			Backbone.history.on("beforeRoute", _.bind(this.reorderMruList, this));

			if(Nuui.config.MRU_MANAGER_SWITCH){

				this.mruList = [];

				if(Nuui.config.MRU_CLEAR_INTERVAL){
					setInterval(_.bind(this.mruClear, this), Nuui.config.MRU_CLEAR_INTERVAL);
				}
			}
		},

		handle:function(dir, file){
			var modulePath = "module/" + dir + "/controller/" + file;
			/*约定: 模块路径必须有文件夹名与路由文件夹名组成*/
			if(this.isModuleLoaded(modulePath)){
				return;
			}

			var fragment = Backbone.history.fragment;
			var hashChanged = false;

			var onRequireSuccess = _.bind(function(Controller){
				this.addModule(modulePath);
				if(_.isFunction(Controller)){
					new Controller(dir + "/" + file + "/");
				}
				if(!hashChanged){
					Backbone.history.loadUrl(fragment);
				}
				this.triggerMethod("after:load");
			}, this);

			var onRequireError = _.bind(function(error){
				this.triggerMethod("after:load", error);
				throw error;
			}, this);

			this.triggerMethod("before:load");
			require([modulePath], onRequireSuccess, onRequireError);

			Backbone.history.once("beforeRoute", function(){
				hashChanged = true;
			});
		},
		
		isModuleLoaded:function(modulePath){
			return this.moduleStates[modulePath];
		},
		
		addModule:function(modulePath){
			this.moduleStates[modulePath] = true;
			console.log('completely get a new module<',modulePath,'>');

			if(Nuui.config.MRU_MANAGER_SWITCH){

				this.mruList.push(modulePath);

				if(Nuui.config.MRU_CLEAR_IMMEDIATELY){
					this.checkMruList();
				}
			}
		},

		checkMruList: function(){
			if(this.mruList.length > Nuui.config.MRU_MAXIMUM){
				this.deleteOverflowModules();
			}
		},

		deleteOverflowModules:function(){
			while(this.mruList.length > Nuui.config.MRU_MAXIMUM){
				this.deleteModule(this.mruList[0]);
			}
		},

		deleteModule:function(modulePath){
			console.log('===================> 删除', modulePath, ' <===================');
			var fragment = modulePath.split("/");

			this.deleteModuleFromMruList(modulePath);
			this.deleteModuleFromBackbone('/^' + fragment[1] + '\\/' + fragment[3] + '\\/');
			this.deleteModuleFromRequireJS(fragment[0] + '/' + fragment[1] + '/');// 注意: requireJs的清理是以文件夹为单位来清理, 没法精确controller路由引用的文件进行清理
		},

		/*
		 * 清理mru列表
		 * */
		deleteModuleFromMruList: function(modulePath){
			this.mruList.splice(
				this.mruList.indexOf(modulePath)
				, 1);
			delete this.moduleStates[modulePath];
		},

		/*
		 * 清理Backbone组件里的缓存, 缓存变量是Backbone.history.handlers
		 * */
		deleteModuleFromBackbone: function(modulePath){
			var remainHandlers = [];
			var len = Backbone.history.handlers.length;
			for(var i = 0; i < len; i++){
				var handler = Backbone.history.handlers[i];
				var routeString = handler.route.toString();
				var isRemainHandler = routeString.indexOf(modulePath) == -1;
				if(isRemainHandler){
					remainHandlers.push(handler);
				}
			}
			Backbone.history.handlers = remainHandlers;

			console.log('1, 缓存清理Backbone.history:  清理模块名 = ',modulePath, '原来数量', len ,'减去清理数量', len - remainHandlers.length, '等于剩余数', remainHandlers.length);
		},

		/*
		 * 清理requireJs组件里的缓存, 缓存变量是defined, urlFetched, 并清理script标签
		 * */
		deleteModuleFromRequireJS:function(modulePath){
			var isMatched = function(attr){
				// 匹配modulePath字符串在前头, 忽略"./"的头部
				if(attr.slice(0, 2) == './'){
					attr = attr.slice(2)
				}
				return attr.indexOf(modulePath) === 0;
			};
			var definedCount = 0, urlFetchedCount = 0, scriptCount = 0;

			// delete from defined
			var defined = window.require.s.contexts._.defined;
			for(var attr in defined){
				if(isMatched(attr)){
					definedCount++;
					delete defined[attr]
				}
			}

			// delete from urlFetched
			var urlFetched = window.require.s.contexts._.urlFetched;
			for(var attr in urlFetched){
				if(isMatched(attr)){
					urlFetchedCount++;
					delete urlFetched[attr]
				}
			}

			// delete script tags
			var scriptTags = document.getElementsByTagName('script');
			var head =  document.getElementsByTagName('head')[0];
			var i = scriptTags.length - 1;
			while(i){
				var attr = scriptTags[i].getAttribute( 'data-requiremodule' ) || '';
				if(isMatched(attr)){
					scriptCount++;
					head.removeChild(scriptTags[i]);
				}
				i--;
			}

			console.log('2, 缓存清理require:');
			console.log('        删除的defined数量有',definedCount );
			console.log('        删除的urlFetched数量有',urlFetchedCount );
			console.log('        删除的script数量有',scriptCount );
		},

		/*
		* 调整mruList顺序
		* */
		reorderMruList: function(e) {
			// 模块加载器不需调整mruList顺序
			if(e.router === this){
				return
			}

			var fragment = e.fragment.split('/');
			var curModule = 'module/' + fragment[0] + '/controller/' + fragment[1];
			var lastModule = this.mruList[this.mruList.length - 1];
			var curModuleIndexOfMru = this.mruList.indexOf(curModule);
			var isCurModuleInMru = curModuleIndexOfMru !== -1;

			if (isCurModuleInMru && curModule !== lastModule) {
				this.mruList.push(
					this.mruList.splice(curModuleIndexOfMru, 1)[0]
				); console.log('mruList has changed = ', this.mruList);
			}
		}
	});

});
