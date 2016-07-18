(function () {
    'use strict';

    angular.module('app', [
        'ui.router',
        'app.controllers'
        ])
    
    .config(['$urlRouterProvider', '$stateProvider', '$locationProvider', function ($urlRouterProvider, $stateProvider, $locationProvider) {
        $locationProvider.html5Mode({
            requireBase: true,
            enabled: true
        });

        $urlRouterProvider.otherwise('/item-search');

        $stateProvider
        .state('app', {
          url: '',
            templateUrl: './views/app.html',
            controller: 'RootCtrl',
        })
        .state('app.home', {
          url: '',
          abstract: true,
            templateUrl: './views/home/home.html',
            controller: 'HomeCtrl',
            resolve: {
                caLocaleInfo: ['$http', function ($http) {
                    return $http({
                        method: 'POST',
                        url: '/api/locale-options',
                        headers: { 'Content-Type': 'application/json' }
                    }).then(function (res) {
                        return res.data;
                    }, function (err) {
                        console.log('err: ', err);
                    });
                }]
            }
        })
        .state('app.home.item-search', {
            url: '/item-search',
            templateUrl: './views/home/mode/item-search.html',
            controller: 'ItemSearchCtrl'
        })
        .state('app.home.item-look-up', {
            url: '/item-look-up',
            templateUrl: './views/home/mode/item-look-up.html'
        });
    }])
    
    .filter('isArray', function() {
        return function (input) {
            return angular.isArray(input);
        };
    })

    .filter('isObject', function() {
        return function (input) {
            return angular.isObject(input);
        };
    });



})();