//=====================================
//function:   combine base module
//Author:     dr.chan
//contact:    798095202@qq.com
//date:       2015.1.23
//=====================================

angular.module('controllers',
    [
        'homepageControllers',
        'logControllers',
        'clinicControllers',
        'doctorControllers',
        'chatControllers',
        'userControllers',
        'healthInfoControllers',
        'healthManageControllers',
        'searchDoctorControllers',
        'healthEvaControllers'
    ]
);

angular.module('services', 
	[
        'userServices'
 	]
);

angular.module('filters', []);

angular.module('derictives', []);