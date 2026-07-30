import React from 'react';
import { View, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import FormularioRifa from './FormularioRifa';

export default function CodigoCorreto({ onVoltar, rifas, setRifas }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#706054' }}>
      <View style={styles.container}>
        
        <TouchableOpacity style={styles.btnVoltar} onPress={onVoltar}>
          <Image 
            source={require('./Images/voltar.png')} 
            style={{ width: '100%', height: '100%', resizeMode: 'contain' }} 
          />
        </TouchableOpacity>

        <Image style={styles.logo} source={require('./Images/logoRifosa.png')}/>
        
        <FormularioRifa onVoltar={onVoltar} rifas={rifas} setRifas={setRifas} />

      </View> 
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  btnVoltar: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 35,
    height: 35,
    zIndex: 10, // Garante que o botão fique clicável por cima de tudo
    marginTop: 10,
  },
  logo: {
    width: 100,
    height: 100,
    marginTop: 15,
    resizeMode: 'contain',
  },
});