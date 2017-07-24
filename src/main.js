import Vue from 'vue'

import VueRouter from 'vue-router'
Vue.use(VueRouter);

let VueFire = require('vuefire');
Vue.use(VueFire);

import Toasted from 'vue-toasted'
Vue.use(Toasted);

import Vuetify from 'vuetify'
Vue.use(Vuetify);



let firebase = require('firebase');
let config = {
  apiKey: "AIzaSyCp8ZqvogBRaKNg5AV_nYeF4vO9eVu7aMQ",
  authDomain: "vuejs-d246d.firebaseapp.com",
  databaseURL: "https://vuejs-d246d.firebaseio.com",
  projectId: "vuejs-d246d",
  storageBucket: "vuejs-d246d.appspot.com",
  messagingSenderId: "437720277341"
};
firebase.initializeApp(config);


const Home = () => import(/* webpackChunkName: "home" */'./components/Home.vue');
const AdminLogin = () => import(/* webpackChunkName: "AdminLogin" */'./components/AdminLogin.vue');
const ProductList = () => import(/* webpackChunkName: "ProductList" */'./components/ProductList.vue');
const ProductDetail = () => import(/* webpackChunkName: "ProductDetail" */'./components/ProductDetail.vue');
const Color = () => import(/* webpackChunkName: "Color" */'./components/Color.vue');
const ColorDetail = () => import(/* webpackChunkName: "ColorDetail" */'./components/ColorDetail.vue');
const Size = () => import(/* webpackChunkName: "Size" */'./components/Size.vue');

const routes = [
  {path: '/', component: Home},
  {path: '/admin', component: AdminLogin},
  {path: '/product-list', component: ProductList},
  {path: '/product-detail/:id', component: ProductDetail, props: true,
    children: [
      {path: 'color', component: Color},
      {path: 'color/:colorName', component: ColorDetail},
      {path: 'size', component: Size}
    ]
  }
];

const router = new VueRouter({
  routes: routes,
  mode: 'history'
});


const app = new Vue({
  router: router,
  data: {
    drawer: true,
    items: [
      { title: 'Home', icon: 'home', path: '/' },
      { title: 'Admin', icon: 'dashboard', path: '/admin' },
      { title: 'Products List', icon: 'featured_play_list', path: '/product-list' },
      { title: 'Product Detail 123', icon: 'star_half', path: '/product-detail/123' },
    ],
    mini: false,
    right: null
  },
  methods: {
    changePath(path){
      router.push(path);
    }
  }
}).$mount('#app');

