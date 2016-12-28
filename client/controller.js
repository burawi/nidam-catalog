var auth = new Vue({
    el: '#auth',
    data: {
        notYetAuthenticated: true,
        seeModal: false,
        register: false,
        authForm: {
            email: '',
            password: '',
            // confirmPassword: '',
            username: ''
        },
        errorMsg: '',
        userId: 0,
    },
    methods: {
        showModal: function() {
            this.seeModal = true;
        },
        hideModal: function() {
            this.seeModal = false;
        },
        switchForm: function() {
            this.register = this.register !== true;
        },
        loadUserId: function() {
            var url = window.location.origin + '/auth/session/userid';
            this.$http.post(url).then(function (response) {
                var resBody = response.body;
                if(!resBody.success){
                }else{
                    this.userId = resBody.msg;
                }
            });
        },
        nowIsAuthenticated: function() {
            this.hideModal();
            this.notYetAuthenticated = false;
            this.loadUserId();
        },
        showError: function (msg) {
            this.errorMsg = msg;
        },
        submit: function() {
            var url = window.location.origin + '/';
            url += (this.register) ? 'auth/register' : 'auth/login';
            this.$http.post(url,this.authForm).then(function (response) {
                var resBody = response.body;
                if(!resBody.success){
                    this.showError(resBody.msg);
                }else{
                    this.nowIsAuthenticated();
                    document.getElementById('auth-block').innerHTML = resBody.msg;
                }
            });
        }
    }
})
auth.loadUserId();
