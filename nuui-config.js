define(function(require, exports, module){
	/**
	 * @namespace config
	 * @memberof Nuui
	 * @desc 配置定义空间
	 */

	/**
	 * @constant {string} CONFIG_INDEX_AUCHOR
	 * @memberof Nuui.config
	 * @desc 首页锚点
	 */
	exports.CONFIG_INDEX_AUCHOR = "example/index/index";
	//exports.CONFIG_INDEX_AUCHOR = "md1/index/cacheDemo";

	/**
	 * @constant {boolean} CONFIG_MOCK_SERVER
	 * @memberof Nuui.config
	 * @desc 是否使用虚拟报文
	 */
	exports.CONFIG_MOCK_SERVER = true;

	/**
	 * @namespace MRU模块管理
	 * @memberof Nuui
	 * @desc MRU模块管理
	 * 内容: 清理Backbone路由缓存与RequireJs的模块输出缓存
	 * 时机: 以单个个功能模块区的完整下载作为缓存添加的时机 //todo
	 */
	/**
	 * @constant {boolean} SWITCH_MODULE_MRU_MANAGER
	 * @memberof Nuui.config
	 * @desc 是否使用MRU模块管理功能
	 */
	//exports.SWITCH_MODULE_MRU_MANAGER = true;
	exports.MRU_MANAGER_SWITCH = true;

	/**
	 * @constant {number} MODULE_MRU_MAXIMUM
	 * @memberof Nuui.config
	 * @desc 最大保留的MRU模块数量
	 */
	//exports.MODULE_MRU_MAXIMUM = 2;
	exports.MRU_MAXIMUM = 2;

	/**
	 * @constant {boolean} CLEAR_MODULE_MRU_IMMEDIATE
	 * @memberof Nuui.config
	 * @desc 是否立即清理MRU模块
	 */
	exports.MRU_CLEAR_IMMEDIATELY = true;

	/**
	 * @constant {number} CLEAR_MODULE_MRU_INTERVAL
	 * @memberof Nuui.config
	 * @desc MRU模块的定时清理间隔, 若值是零表示不使用定时清理功能
	 */
	exports.MRU_CLEAR_INTERVAL = 0;
});
