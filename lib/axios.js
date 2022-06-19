'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var mergeConfig = require('./core/mergeConfig');
var defaults = require('./defaults');
var formDataToJSON = require('./helpers/formDataToJSON');
/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);

  //*这里的instance this指向Axios的实例，调用axios相当于调用Axios.prototype.request; 
  // *例如axios({})相当于Axios.prototype.request({})
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  // *这也是为什么可以使用axios.get方法，实际上是使用的是 Axios.prototype.get
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  // *将Axios的实例属性复制到axios上，
  // *这也是axios.defaults和axios.interceptors可以使用的原因
  // *实际上是在使用Axios().defaults和Axios().interceptors
  utils.extend(instance, context);

  // Factory for creating new instances
  // *使axios可以递归的创建实例，实例创建的实例也拥有create属性
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.CanceledError = require('./cancel/CanceledError');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');
axios.VERSION = require('./env/data').version;
axios.toFormData = require('./helpers/toFormData');

// Expose AxiosError class
axios.AxiosError = require('../lib/core/AxiosError');

// alias for CanceledError for backward compatibility
axios.Cancel = axios.CanceledError;

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

// Expose isAxiosError
axios.isAxiosError = require('./helpers/isAxiosError');

axios.formToJSON = function(thing) {
  return formDataToJSON(utils.isHTMLForm(thing) ? new FormData(thing) : thing);
};

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;
