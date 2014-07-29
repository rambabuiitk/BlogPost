/**
 * Author: Per Spilling, per@kodemaker.no
 */
var myApp = angular.module('blogs', ['ngResource', 'ui.bootstrap'], function ($dialogProvider) {
    $dialogProvider.options({backdropClick: false, dialogFade: true});
});

/**
 * Configure the BlogsResource. In order to solve the Single Origin Policy issue in the browser
 * I have set up a Jetty proxy servlet to forward requests transparently to the API server.
 * See the web.xml file for details on that.
 */
myApp.factory('BlogsResource', function ($resource) {
    return $resource('/api/blogs', {}, {});
});

myApp.factory('BlogResource', function ($resource) {
    return $resource('/api/blogs/:id', {}, {});
});

function BlogsCtrl($scope, BlogsResource, BlogResource, $dialog, $q) {
    /**
     * Define an object that will hold data for the form. The persons list will be pre-loaded with the list of
     * persons from the server. The personForm.person object is bound to the person form in the HTML via the
     * ng-model directive.
     */
    $scope.blogForm = {
        show: true,
        blog: {}
    }
    $scope.blogs = BlogsResource.query();

    /**
     * Function used to toggle the show variable between true and false, which in turn determines if the person form
     * should be displayed of not.
     */
    $scope.toggleBlogForm = function () {
        $scope.blogForm.show = !$scope.blogForm.show;
    }

    /**
     * Clear the person data from the form.
     */
    $scope.clearForm = function () {
        $scope.blogForm.blog = {}
    }

    /**
     * Save a person. Make sure that a person object is present before calling the service.
     */
    $scope.saveBlog = function (blog) {
        if (blog != undefined) {
            /**
             * Here we need to ensure that the PersonsResource.query() is done after the PersonsResource.save. This
             * is achieved by using the $promise returned by the $resource object.
             */
            BlogsResource.save(blog).$promise.then(function() {
                $scope.blogs = BlogsResource.query();
                $scope.blogsForm.blog = {}  // clear the form
            });
        }
    }

    /**
     * Set the person to be edited in the person form.
     */
    $scope.editPerson = function (p) {
        $scope.blogForm.blog = p
    }

    /**
     * Delete a person. Present a modal dialog box to the user to make the user confirm that the person item really
     * should be deleted.
     */
    $scope.deleteBlog = function (blog) {
        var msgBox = $dialog.messageBox('You are about to delete a blog from the database', 'This cannot be undone. Are you sure?', [
            {label: 'Yes', result: 'yes'},
            {label: 'Cancel', result: 'no'}
        ])
        msgBox.open().then(function (result) {
            if (result === 'yes') {
                // remove from the server and reload the person list from the server after the delete
                BlogResource.delete({id: blog.id}).$promise.then(function() {
                    $scope.blogs = BlogsResource.query();
                });
            }
        });
    }
}

/*
 $scope.kodemakerPersons = {}
 $scope.persons = PersonsResource.query(function (response) {
 angular.forEach(response, function (person) {
 console.log('person.name=' + person.name)
 });
 });
 */