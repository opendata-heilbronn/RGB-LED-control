angular.module("animation-editor", [
		"ngMaterial"
	]
);

angular.module("animation-editor")
	.constant("API_URL", "http://192.168.178.168:3000");

angular.module("animation-editor")
	.factory("roomService", function ($http, API_URL)
	{
		//var apiUrl = window.location.protocol + "//" + window.location.hostname + ":3000";
		var apiUrl = API_URL;
		var roomService = {
			getAllRooms: function ()
			{
				return $http.get(apiUrl + "/api/devices").then(function (result)
				{
					return result.data;
				})
			}
		};
		return roomService;
	});

angular.module("animation-editor")
	.factory("animationService", function($http, API_URL)
	{
		var apiUrl = API_URL;
		var animationService = {
			getAllAnimations: function()
			{
				return $http.get(apiUrl + "/api/anim").then(function(result)
				{
					return result.data.animations;
				});
			},
			getAnimation: function(name) 
			{
				return $http.get(apiUrl + "/api/anim/" + name).then(function(result)
				{
					return result.data[name];
				});
			},
			saveAnimation: function(name, animation)
			{
				var data = {};
				data[name] = animation;
				return $http.post(apiUrl + "/api/anim/" + name, data).then(function(result)
				{
					return result.data;
				});
			}
		}
		return animationService;
	});

angular.module("animation-editor")
.controller("mainCtrl", function (roomService, animationService)
{
	var vm = this;
	vm.animations = [];
	vm.animationName = "";
	roomService.getAllRooms().then(function (result)
	{
		vm.rooms = result;
		console.log(vm.rooms);
	});
	
	animationService.getAllAnimations().then(function (result)
	{
		vm.onlineAnimations = result;
		console.log(vm.onlineAnimations);
	});

	vm.getWhiteOrBlack = getWhiteOrBlack;
	vm.animation = [];

	vm.addFrame = function ()
	{
		vm.animation.push({
			"frameData": [],
			"pause": 0
		})
	};

	vm.addFrameData = function (frame)
	{
		frame.frameData.push({
			"room": "all",
			"color": "#000000",
			"fade": 0
		});
	}

	vm.openMenu = function($mdOpenMenu, $event) 
	{
		$mdOpenMenu($event);
	};

	vm.loadAnimation = function(name) 
	{
		animationService.getAnimation(name).then(function(result)
		{
			vm.animationName = name;
			vm.animation = result;
		});
	};

	vm.save = function() 
	{
		animationService.saveAnimation(vm.animationName, vm.animation).then(function(result)
		{
			if(result.status !== 'success')
			{
				console.log(result);
			}
			animationService.getAllAnimations().then(function (result)
			{
				vm.onlineAnimations = result;
			});
		});
	};
});


function assignTo(target)
{
	return function (result)
	{
		target = result;
		console.log(target);
	}
}

function getWhiteOrBlack(color)
{
	var red = color.substr(1, 2);
	var green = color.substr(3, 2);
	var blue = color.substr(5, 2);
	if ((red*0.299 + green*0.587 + blue*0.114) > 186)
	{
		return "#000000";
	}
	return "#FFFFFF";
}