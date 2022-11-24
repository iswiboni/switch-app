import { View, Text, Button, PermissionsAndroid, TextInput, TouchableOpacity, FlatList } from 'react-native'
import React, { useRef, useState } from 'react'
import Smartconfig from 'react-native-smartconfig'


const App = () => {
  const refList = useRef(null)
  const [logs, setlogs] = useState([])
  const [wifi, setwifi] = useState({
    ssid: 'test',
    pwd: 'test1234',
    ip: null,
    state: false
  })

  const adding_logs = (text) => {
    setlogs(logs => [
      ...logs,
      text
    ])
  }

  const wifi_permission = () => {
    PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then(permission => {
      console.log("checkPermission", permission)
      if (!permission) {
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        adding_logs('sedang meminta izin : lokasi perangkat')
      } else {
        adding_logs('izin lokasi : OK')
      }
    })
  }


  const send_command = (cmd) => {
    if (!wifi.state) return alert('Belum terkoneksi dengan perangkat!')

    const url_cmd = 'http://' + wifi.ip + '/' + cmd
    fetch(url_cmd)
      .then(doc => doc.json())
      .then((doc) => {

        adding_logs(JSON.stringify(doc))
      })
  }

  const begin_connect = () => {
    try {
      adding_logs('memulai koneksi')

      wifi_permission()

      Smartconfig.start({
        type: 'esptouch', //or airkiss, now doesn't not effect
        ssid: wifi.ssid,
        bssid: '', //"" if not need to filter (don't use null)
        password: wifi.pwd,
        timeout: 50000, //now support (default 30000)
      }).then(function (results) {
        adding_logs('koneksi berhasil terhubung ke : ' + JSON.stringify(results[0]))


        setwifi({
          ...wifi,
          ip: results[0]?.ipv4,
          state: true
        })


      }).catch(function (error) {
        adding_logs('koneksi error dengan pesan : ', JSON.stringify(error))
      });

      Smartconfig.stop(); //interrupt task
    } catch (error) {
      adding_logs('kesalahan fatal : ', error)
    }

  }

  console.log(logs)


  return (
    <View style={{
      flex: 1,
      padding: 20,
    }}>
      <Text>Wifi :</Text>
      <TextInput
        defaultValue={wifi.ssid}
        onChangeText={(ssid) => {
          setwifi({ ...wifi, ssid })
        }}
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          paddingLeft: 10
        }}
      />
      <Text style={{
        marginTop: 10
      }}>Pass  :</Text>
      <TextInput
        defaultValue={wifi.pwd}
        onChangeText={(pwd) => {
          setwifi({ ...wifi, pwd })
        }}
        style={{
          borderWidth: 1,
          borderColor: '#ddd',
          paddingLeft: 10,
          marginBottom: 20
        }}
      />
      <FlatList
        ref={refList}
        data={logs}
        onContentSizeChange={() => refList.current.scrollToEnd({ animated: true })}
        onLayout={() => refList.current.scrollToEnd({ animated: true })}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item}</Text>
          </View>
        )
        }
      />

      <View style={{
        flexDirection: 'row',
        marginTop: 'auto',
        paddingTop: 20
      }}>
        <TouchableOpacity
          onPress={begin_connect}
          disabled={wifi.state}
          style={{
            backgroundColor: '#ddd',
            padding: 10,
            alignItems: 'center',
            flex: 1
          }}>
          <Text>Mulai koneksi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => send_command('off')}
          style={{
            backgroundColor: 'red',
            padding: 10
          }}>
          <Text style={{
            color: '#fff',
          }}>Lampu OFF</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => send_command('on')}
          style={{
            backgroundColor: 'green',
            padding: 10
          }}>
          <Text style={{
            color: '#fff',
          }}> Lampu ON</Text>
        </TouchableOpacity>

      </View>

    </View>
  )
}

export default App