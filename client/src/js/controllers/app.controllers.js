(function () {
    angular.module('app.controllers', [])

    .controller('RootCtrl', ['$scope', '$state', function ($scope, $state) {
        $scope.$state = $state;
    }])

    .controller('HomeCtrl', ['$scope', 'caLocaleInfo', function ($scope, caLocaleInfo) {
        console.log('caLocaleInfo', caLocaleInfo);
        $scope.caLocale = caLocaleInfo;

        var initMarket = angular.copy($scope.caLocale[4]);
        initOptions(initMarket);
        $scope.selectedMarket = initMarket;
        console.log(initMarket);

        function initOptions (market) {
            $scope.options = {
                searchIndex: market.searchIndex,
                sort: market.sortValues[0]
            };
        }
    }])

    .controller('ItemSearchCtrl', ['$scope', '$http', function ($scope, $http) {

        $scope.selectedFilter = null;
        $scope.currentProducts = new Array();
        $scope.error = {};

        $scope.setSelectedMarket = function () {
            $scope.caLocale.forEach(function (market, marketIndex) {
                if (market.searchIndex === $scope.options.searchIndex) {
                    $scope.selectedMarket = market;
                    initOptions(market);
                    return;
                }
            });
        };

        $scope.filters = {
            SalesRank: {
                reverse: false,
                filterFunc: function (product) {
                    if (product.SalesRank && product.SalesRank.length) {
                        return parseInt(product.SalesRank[0]);
                    } else {
                        return undefined;
                    }
                }
            },
            ListPrice: {
                reverse: false,
                filterFunc: function (product) {
                    if(product.Offers &&
                    product.Offers[0].Offer &&
                    product.Offers[0].Offer[0].OfferListing && 
                    product.Offers[0].Offer[0].OfferListing[0].Price[0]) {
                        return parseInt(product.Offers[0].Offer[0].OfferListing[0].Price[0].Amount[0]);
                    } else {
                        return undefined;
                    }
                }
            }
        };

        $scope.setSelectedFilter = function (newFilter) {
            if (_.isEqual($scope.selectedFilter, $scope.filters[newFilter])) $scope.selectedFilter.reverse = !$scope.selectedFilter.reverse;
            else $scope.selectedFilter = $scope.filters[newFilter];
        };
        
        $scope.newArray = function (num) {
            return new Array(Math.ceil(num));
        };

        $scope.submit = function () {
            var optionsCopy = angular.copy($scope.options);
            $scope.error.show = false;
            
            $scope.submitting = true;
            // set correct ammounts to min/max prices
            if (optionsCopy.maximumPrice) optionsCopy.maximumPrice *= 100;
            if (optionsCopy.minimumPrice) optionsCopy.minimumPrice *= 100;
            
            // set condition
            if (!optionsCopy.condition) optionsCopy.condition = 'New'; 
            console.log('options: ', $scope.options);

            if (optionsCopy.sort === 'None') delete optionsCopy.sort;

            optionsCopy.itemPage = 1;

            async.waterfall([
                function (seriesCB) {
                    $http({
                        method: 'POST',
                        url: '/api/item-search',
                        data: optionsCopy,
                        headers: { 'Content-Type': 'application/json' }
                    }).then(function (res) {
                        console.log('res: ', res);
                        $scope.currentProducts = [];
                        $scope.currentProducts = $scope.currentProducts.concat(res.data.products);
                        seriesCB(null, parseInt(res.data.totalPages));
                    }, function (err) {
                        seriesCB(err);
                    });
                },
                function (totalPages, seriesCB) {
                    var maxPages = totalPages > 10 ? 10 : totalPages;
                    async.times(maxPages-1, function (n, next) {

                        setTimeout(function() {

                            optionsCopy.itemPage = n + 1;

                            $http({
                                method: 'POST',
                                url: '/api/item-search',
                                data: optionsCopy,
                                headers: { 'Content-Type': 'application/json' }
                            }).then(function (res) {
                                console.log('res: ', res);
                                $scope.currentProducts = $scope.currentProducts.concat(res.data.products);
                                next();
                            }, function (err) {
                                next(err);
                            });

                        }, 1000 * n);
                        
                    }, function (err) {
                        return seriesCB(err);
                    });
                }
            ], function (err) {
                $scope.submitting = false;

                if (err) {
                    $scope.error = err;
                    console.log('err', err);
                    $scope.error.show = true;

                    if (err.data && err.data.Message && err.data.Message[0]) {
                        let errMsg = angular.copy(err.data.Message[0].split("'")[0]);
                        $scope.error.message = errMsg;
                        
                        let index = err.data.Message[0].indexOf("'");
                        let string = angular.copy((err.data.Message[0].slice(index)));
                        console.log(string.split(","));
                        $scope.error.list = string.split(",");
                        console.log($scope.error);
                    } else {
                        $scope.error.message = "Internal Server Error";
                    }
                } else {
                    // sucess alert
                }
            });
        };
    }]);
})();