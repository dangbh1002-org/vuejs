<template>
  <div>
    <v-container fluid>

      <v-layout row>
        <v-flex md3></v-flex>
        <v-flex md6>

          <form role="form" v-on:submit.prevent="signIn()" v-if="!user || user.isAdmin">
            <v-card class="">

              <v-card-text>
                <h2>{{(user && user.isAdmin)?'Administrator':'Please Sign In'}}</h2>
                <hr class="colorgraph">

                <br>
                <v-text-field v-show="user && user.isAdmin"
                              label="Display Name"
                              single-line
                              hide-details
                              v-model="displayName"
                ></v-text-field>
                <v-text-field
                  label="Email Address"
                  single-line
                  hide-details
                  v-model="email"
                ></v-text-field>
                <v-text-field
                  label="Password"
                  single-line
                  hide-details
                  v-model="password"
                ></v-text-field>
                <br>

                <v-layout row justify-space-between>
                  <v-btn class="primary white--text" disabled>
                    Remember Me
                    <v-icon dark right>check_circle</v-icon>
                  </v-btn>
                  <v-btn class="primary white--text"
                         v-tooltip:bottom="{ html: 'Reset now' }"
                         @click="resetPassword()">
                    Forgot Password?
                  </v-btn>
                </v-layout>
                <br>
                <hr class="colorgraph">
                <br>
                <v-layout>

                  <v-flex xs12 style="margin-bottom: 10px" v-show="loginMessage">
                    <span :style="{'color':loginError?'red':'purple'}">{{loginMessage}}</span>
                  </v-flex>
                </v-layout>

                <v-layout row justify-space-between>
                  <v-btn type="submit" class="purple white--text">Sign In</v-btn>
                  <v-btn class="purple white--text" @click="createUser()" :disabled="!user || !user.isAdmin">Register</v-btn>
                </v-layout>
              </v-card-text>

            </v-card>
          </form>

        </v-flex>
      </v-layout>

      <v-layout v-if="auth">
        <v-flex xs12>

          <v-card>
            <v-card-text>

              <p>Display name: <b>{{auth.displayName}}</b></p>
              <p>Email: <b>{{auth.email}}</b></p>

              <v-btn @click="signOut()">Sign out</v-btn>

            </v-card-text>
          </v-card>

        </v-flex>
      </v-layout>

    </v-container>

    <keep-alive>
      <admin v-if="auth"></admin>
    </keep-alive>

  </div>



</template>

<script>

  const Admin = () => import(/* webpackChunkName: "Login" */'./Admin.vue');
  let firebase = require('firebase');

  export default {
    components: {
      Admin
    },
    data() {
      return {
        loginError: null,
        loginMessage:null,

        displayName: null,
        email: 'science.mbti@gmail.com',
        password: '88888888',

        auth: null,
        user: null
      }
    },
    created(){
      this.getAuth();
    },
    methods:{

      createUser() {

        let vm = this;
//        if (!$scope.user.isAdmin) {
//          return;
//        }

        firebase.auth().createUserWithEmailAndPassword(vm.email, vm.password).then(function (user) {

          firebase.database().ref().child('users/' + user.uid).update({
            email: vm.email
          });

          user.updateProfile({
            displayName: vm.displayName,
            photoURL: ""
          }).then(function () {
            // Update successful.
          }, function (error) {
            vm.loginError = true;
            vm.loginMessage = error.message;
            // An error happened.
          });

          user.sendEmailVerification().then(function () {
            console.log('Verification email sent.');

            firebase.auth().sendPasswordResetEmail(user.email).then(function () {
              console.log('PasswordReset email sent.');
            }, function (error) {
              // An error happened.
            });

          }, function (error) {
            // An error happened.
          });

        }).catch(function (error) {
          // Handle Errors here.
          vm.loginError = true;
          vm.loginMessage = error.message;
          // ...
        });
      },

      signIn() {

        firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(function (auth) {

        }).catch(function (error) {

          this.loginError = true;
          this.loginMessage = error.message;

        });
      },

      signOut() {

        let vm = this;
        firebase.auth().signOut().then(function () {
          // Sign-out successful.

          vm.auth = null;
          vm.user = null;
          vm.loginError = null;
          vm.loginMessage = null;

        }, function (error) {
          // An error happened.
        });
      },

      resetPassword() {
        let vm = this;
        firebase.auth().sendPasswordResetEmail(vm.email).then(function () {
          vm.loginError = false;
          vm.loginMessage = 'Reset password email sent.';
        }, function (error) {
          vm.loginError = true;
          vm.loginMessage = error.message;
        });
      },

      getAuth () {
        let vm = this;

        firebase.auth().onAuthStateChanged((auth) => {
          vm.auth = auth;

          if(auth){

            var userRef = firebase.database().ref().child('users/' + auth.uid);
            userRef.on('value', function (snapshot) {
              vm.user = snapshot.val();

            });

          }

        });
      }
    }
  }

</script>

<style lang="stylus">
  .colorgraph{
    height 5px
    border none
    border-radius 2px
    background-image: -webkit-linear-gradient(left, #c4e17f, #c4e17f 12.5%, #f7fdca 12.5%, #f7fdca 25%, #fecf71 25%, #fecf71 37.5%, #f0776c 37.5%, #f0776c 50%, #db9dbe 50%, #db9dbe 62.5%, #c49cde 62.5%, #c49cde 75%, #669ae1 75%, #669ae1 87.5%, #62c2e4 87.5%, #62c2e4);
    background-image: -moz-linear-gradient(left, #c4e17f, #c4e17f 12.5%, #f7fdca 12.5%, #f7fdca 25%, #fecf71 25%, #fecf71 37.5%, #f0776c 37.5%, #f0776c 50%, #db9dbe 50%, #db9dbe 62.5%, #c49cde 62.5%, #c49cde 75%, #669ae1 75%, #669ae1 87.5%, #62c2e4 87.5%, #62c2e4);
    background-image: -o-linear-gradient(left, #c4e17f, #c4e17f 12.5%, #f7fdca 12.5%, #f7fdca 25%, #fecf71 25%, #fecf71 37.5%, #f0776c 37.5%, #f0776c 50%, #db9dbe 50%, #db9dbe 62.5%, #c49cde 62.5%, #c49cde 75%, #669ae1 75%, #669ae1 87.5%, #62c2e4 87.5%, #62c2e4);
    background-image: linear-gradient(to right, #c4e17f, #c4e17f 12.5%, #f7fdca 12.5%, #f7fdca 25%, #fecf71 25%, #fecf71 37.5%, #f0776c 37.5%, #f0776c 50%, #db9dbe 50%, #db9dbe 62.5%, #c49cde 62.5%, #c49cde 75%, #669ae1 75%, #669ae1 87.5%, #62c2e4 87.5%, #62c2e4);
  }
</style>
