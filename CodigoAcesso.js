import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';

export default function CodigoAcesso({ onVoltar, onNavegar, rifas, setRifaAtiva, setVendaAtiva }) {
  const [codigoInserido, setCodigo] = useState('');

  const handleEnviar = () => {
    const cod = codigoInserido.trim().toUpperCase();

    if (!cod) {
      alert('Por favor, digite um código de acesso!');
      return;
    }

    // 1. Se for código de GERENCIAMENTO (começa com RIF)
    if (cod.startsWith('RIF')) {
      const rifaEncontrada = rifas.find(r => r.codigoRifa === cod);

      if (rifaEncontrada) {
        setRifaAtiva(rifaEncontrada);
        onNavegar('telaGerenciar');
      } else {
        alert('Código não encontrado!');
      }

    // 2. Se for código de COMPRA (começa com VEN)
    } else if (cod.startsWith('VEN')) {
      let rifaDonaDaVenda = null;
      let loteVendaEncontrado = null;

      // Procura a qual rifa pertence esse código de venda
      for (let r of rifas) {
        const v = r.codigosVenda.find(venda => venda.codigoVenda === cod);
        if (v) {
          rifaDonaDaVenda = r;
          loteVendaEncontrado = v;
          break;
        }
      }

      if (!loteVendaEncontrado) {
        alert('Código não encontrado!');
      } else if (loteVendaEncontrado.usado) {
        alert('Este código de venda já foi utilizado e expirou!');
      } else {
        setRifaAtiva(rifaDonaDaVenda);
        setVendaAtiva(loteVendaEncontrado);
        onNavegar('telaCompra');
      }

    } else {
      alert('Código inválido!');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btnVoltar} onPress={onVoltar}>
        <Image 
          source={require('./Images/voltar.png')} 
          style={{ width: '100%', height: '100%', resizeMode: 'contain' }} 
        />
      </TouchableOpacity>

      <Image style={styles.logo} source={require('./Images/logoRifosa.png')}/>
      
      <Text style={styles.ola}>Olá!</Text>
      <Text style={styles.restanteFrase}>Insira seu código de acesso da Rifa:</Text>
      
      <TextInput
        style={styles.input}
        onChangeText={texto => setCodigo(texto)}
        value={codigoInserido}
        placeholder="Código"
        placeholderTextColor="#CCC"
      />
      
      <Button color="#C44E04" title="Acessar" onPress={handleEnviar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    backgroundColor: '#706054',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginTop: 10,
    resizeMode: 'contain',
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
    color: '#FFF',
    marginBottom: 50,
  },
  ola: {
    marginTop: 30,
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: 'white',
    fontFamily: 'Papyrus',
  },
  restanteFrase:{
    fontSize: 18,
    fontWeight: 'normal',
    color: '#FF9754',
    fontFamily: 'Zapfino',
  },
  btnVoltar: {
    position: 'absolute', // Descola a imagem do fluxo normal
    top: 40,              
    left: 20,             
    width: 40,           
    height: 40,           
    resizeMode: 'contain',
  },
});