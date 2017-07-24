<template>
  <v-container fluid>
    <!--<img src="./assets/logo.png">-->

    <h3>Product Management</h3>

    <form v-on:submit.prevent="uploadPic()">
      <v-card>

        <v-card-text>
          <v-container fluid>

            <v-layout row>
              <v-flex xs12>

                <droply id="myDroply"
                        ref="droplyOne"
                        url="https://httpbin.org/post"
                        upload-message-text="Drop file(s) to upload <br><strong>or click</strong>"
                        :maxFileSizeInMB="1"
                        :maxNumberOfFiles="1"
                        :autoProcessQueue="false"

                        @droply-fileAdded="onFileAdded"
                        @droply-removedFile="onFileRemoved"
                >
                </droply>

                <v-progress-linear v-model="progress" v-if="showRemoveAllButton"></v-progress-linear>

                <br>

              </v-flex>
            </v-layout>

            <v-layout row>
              <v-flex xs3>
                <v-subheader>Name</v-subheader>
              </v-flex>
              <v-flex xs9>
                <v-text-field
                  label="Name"
                  single-line
                  hide-details
                  v-model="name"
                ></v-text-field>
              </v-flex>
            </v-layout>

            <v-layout row>
              <v-flex xs3>
                <v-subheader>Price</v-subheader>
              </v-flex>
              <v-flex xs9>
                <v-text-field
                  label="Price"
                  single-line
                  hide-details
                  v-model="price"
                ></v-text-field>
              </v-flex>
            </v-layout>

            <v-layout row>
              <v-flex xs3>
                <v-subheader>Type</v-subheader>
              </v-flex>
              <v-flex xs9>

                <v-select
                  :items="menus"
                  v-model="type"
                  label="Select Type"

                  item-text="name"
                  item-value="code"

                  single-line
                  bottom
                ></v-select>

              </v-flex>
            </v-layout>

            <v-layout row>
              <v-flex xs12>
                <v-btn class="success" type="submit">Add</v-btn>
              </v-flex>

            </v-layout>

          </v-container>
        </v-card-text>

      </v-card>
    </form>

    <br>

    <v-layout row justify-center>
      <v-progress-circular indeterminate :size="70" :width="7" class="purple--text"
                           v-if="loading"></v-progress-circular>
    </v-layout>


    <v-card v-show="!loading">
      <v-card-title class="indigo">
        <span class="headline white--text">Products List</span>
        <v-spacer></v-spacer>
        <v-text-field
          append-icon="search"
          label="Search"
          single-line
          hide-details class="white--text"
          v-model="search"
          dark
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="anArray"
        :search="search"
        class="white elevation-1"
      >
        <template slot="items" scope="props">
          <!--<tr v-for="(item, index) in anArray">-->
          <td class="text-xs-right">

            <img :src="props.item.images[0].url" alt="" height="100px" class="mt-1">

          </td>

          <td class="text-xs-right">
            <v-text-field
              label="Name"
              single-line
              hide-details
              v-model="props.item.name"
              :disabled="!props.item.editing"
            ></v-text-field>
          </td>
          <td class="text-xs-right">
            <v-text-field
              label="Price"
              single-line
              hide-details
              v-model="props.item.price"
              :disabled="!props.item.editing"
            ></v-text-field>
          </td>
          <td class="text-xs-right" width="200px">

            <v-select
              :items="menus"
              v-model="props.item.type"
              label="Select Type"
              item-text="name"
              item-value="code"
              single-line
              bottom
              :disabled="!props.item.editing"
            ></v-select>

          </td>
          <td class="text-xs-right">

            <template v-if="!props.item.editing">
              <v-btn class="info" @click="edit(props.item, props.index)">Edit</v-btn>
              <v-btn class="warning" @click="remove(props.item)">Remove</v-btn>
            </template>

            <template v-else>
              <v-btn class="success" @click="update(props.item, props.index)">Update</v-btn>
              <v-btn class="info" @click="cancel(props.item, props.index)">Cancel</v-btn>
            </template>

          </td>
          <!--</tr>-->
        </template>
      </v-data-table>

    </v-card>

    <div class="echarts">
      <IEcharts :option="option" :loading="loading" @ready="onReady" @click="onClick"></IEcharts>
    </div>

  </v-container>


</template>

<script>
  import Vue from 'vue'

  let firebase = require('firebase');

  import Droply from 'droply'

  Vue.use(Droply);

  import IEcharts from 'vue-echarts-v3/src/lite.vue';

  Vue.use(IEcharts);

  //  import 'echarts/lib/chart/bar';
  import 'echarts/lib/chart/pie';
  import 'echarts/lib/component/title';

  export default {
    components: {
      Droply,
      IEcharts
    },
    created() {

      this.mapCode2Item = {};
      this.menus.forEach((item) => {
        this.mapCode2Item[item.code] = item;
      });
      this.loading = true;
      this.fetchData();
    },

    data() {
      return {
        loading: false,
        backupObject: {},
        anArray: [],
        name: null,
        price: null,
        type: null,

        picFile: {},

        headers: [
          {text: 'Picture', value: 'picture'},
          {text: 'Name', value: 'name'},
          {text: 'Price', value: 'price'},
          {text: 'Type', value: 'type'},
          {text: 'Action', value: 'action', sortable: false}
        ],
        search: '',

        processQueue: false,
        showRemoveAllButton: false,

        progress: 0,

        menus: [
          {code: 1, name: 'Trang chủ', path: '/', icon: '', color: '#4caf50'},
          {code: 2, name: 'Cổng nhôm đúc', path: '/cong-nhom-duc', icon: '', color: '#4caf50'},
          {code: 3, name: 'Hàng rào', path: '/hang-rao', icon: '', color: '#ef5350'},
          {code: 4, name: 'Ban công', path: '/ban-cong', icon: '', color: '#a289ff'},
          {code: 5, name: 'Bông gió', path: '/bong-gio', icon: '', color: '#20c4cb'},
          {code: 6, name: 'Cầu thang', path: '/cau-thang', icon: '', color: '#FFA800'}
        ],

        dataObject: {},
        chartData: [],
        option: {}
      }
    },

    firebase: {
      anArray: {
        source: firebase.database().ref('products'),
        readyCallback(){
          this.loading = false;
        }
      }
    },

    beforeRouteEnter(to, from, next) {
      next(vm => vm.fetchData())
    },

    methods: {

      initChart(){
        this.chartData = [];

        this.option = {
          title: {
            text: 'Products pie chart'
          },
          tooltip: {},
          xAxis: {
//            data: this.productList
          },
          yAxis: {},
          series: [
            {
              name: 'Reference Page',
              type: 'pie',
              radius: '55%',
              data: this.chartData
            }
          ]
        }
      },

      reDrawChart(){

        this.initChart();
        this.dataObject = {};
        this.menus.forEach((item,key)=>{
          this.dataObject[item.code] = 0;
        });

        this.anArray.forEach((item,key)=>{
          this.dataObject[item.type]++;
        });

        Object.keys(this.dataObject).forEach((key)=>{
          this.chartData.push({name: this.mapCode2Item[key].name, value: this.dataObject[key]})
        })
      },

      onReady(instance) {
//        console.log(instance);
      },
      onClick(event, instance, echarts) {
//        console.log(arguments);
      },

      fetchData() {
        let vm = this;
        firebase.database().ref('products').on('value', function(snapshot) {
          vm.reDrawChart();
          vm.loading = false;
        });
      },

      onFileAdded(file) {
        this.picFile = file;
        this.showRemoveAllButton = true;
      },
      onFileRemoved() {
        this.showRemoveAllButton = false
      },
      removeAll() {
        this.$refs.droplyOne.removeAllFiles()
      },

      uploadPic() {

        if (!this.name || !this.price || !this.type) {
          this.$toasted.error('Name, price and type are required!').goAway(1500);
          return;
        }

        let vm = this;
        let file = this.picFile;

        var now = new Date();
        var timeStamp = now.getTime() + (Math.floor(Math.random() * 8999) + 1000).toString();
        var storageRef = firebase.storage().ref();
        var metadata = {
          contentType: 'image/jpeg'
        };

        var uploadTask = storageRef.child('/productImages/' + timeStamp + '/' + file.name).put(file, metadata);

        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
          function (snapshot) {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

            vm.progress = progress;

//            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case firebase.storage.TaskState.PAUSED: // or 'paused'
//                console.log('Upload is paused');
                break;
              case firebase.storage.TaskState.RUNNING: // or 'running'
//                console.log('Upload is running');
                break;
            }
          }, function (error) {

            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
              case 'storage/unauthorized':
                // User doesn't have permission to access the object
                break;

              case 'storage/canceled':
                // User canceled the upload
                break;

              case 'storage/unknown':
                // Unknown error occurred, inspect error.serverResponse
                break;
            }
          }, function () {
            // Upload completed successfully, now we can get the download URL

            firebase.database().ref().child('/products/' + timeStamp).set({
              name: vm.name,
              price: vm.price,
              type: vm.type,
              position: 999,
              views: 0,
              startedAt: firebase.database.ServerValue.TIMESTAMP,
              images: [
                {
                  fullPath: uploadTask.snapshot.metadata.fullPath,
                  url: uploadTask.snapshot.downloadURL
                }
              ]
            }).then(function () {
              vm.removeAll();
              vm.$toasted.success('Upload success!!!').goAway(1500);

            }).catch(function (error) {
//              alert("Data could not be saved." + error);
            });


          });

      },

      edit(item, index) {

        this.backupObject[item['.key']] = Object.assign({}, item);

        item.editing = true;


        this.$forceUpdate();
      },
      remove(item) {
        let vm = this;
        if (confirm('Are you sure to delete?')) {

          var storageRef = firebase.storage().ref();

          item.images.forEach(function (image) {
            var desertRef = storageRef.child(image.fullPath);

            desertRef.delete().then(() => {

            }).catch((error) => {
              // Uh-oh, an error occurred!
            });
          });

          this.$firebaseRefs.anArray.child(item['.key']).remove().then(() => {
            this.$toasted.error('Deleted item..').goAway(1500);
          });

        }

      },
      update(item, index) {
        let vm = this;
        let newItem = Object.assign({}, item);

        delete newItem['.key'];
        delete newItem.editing;

        this.$firebaseRefs.anArray.child(item['.key']).set(newItem).then(_=>{

        });

        item.editing = false;
        this.$forceUpdate();

        delete this.backupObject[item['.key']];
        this.$toasted.info('Updated item..').goAway(1500);

      },
      cancel(item, index) {
        this.backupObject[item['.key']].editing = false;
        let newItem = this.backupObject[item['.key']];
        this.$set(this.anArray, index, newItem);
        delete this.backupObject[item['.key']];
      }

    }

  }

</script>

<style lang="stylus">
  .input-group {
    margin 0 !important
  }

  .input-group__details::before {
    background-image none !important
  }

  .dz-progress {
    display none
  }

  .echarts {
    width: 400px;
    height: 400px;
  }
</style>
