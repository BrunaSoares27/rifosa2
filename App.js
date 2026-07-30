import React, { useState } from 'react'; 
import { View, Text, Image, StyleSheet, Button, Modal, TouchableOpacity } from 'react-native';
import CodigoAcesso from './CodigoAcesso';
import CodigoCorreto from './CodigoCorreto';
import TelaCompra from './TelaCompra';
import TelaGerenciar from './TelaGerenciar';

//<TouchableOpacity activeOpacity={0.7} onPress={() => setModalSobreVisivel(true)}>

export default function App() {
  const [telaAtual, setTelaAtual] = useState('home');

  const [rifas, setRifas] = useState([
    {
      codigoRifa: 'RIF123',
      nomeProprietario: 'Bruna Soares',
      tituloPremio: 'iPhone 15 Pro Max',
      valorRifa: '10,00',
      dataSorteio: '25/12/2026',
      numeroInicial: 1,
      numeroFinal: 60,
      fotoPremio: 'https://i.pinimg.com/736x/ba/ac/2a/baac2a0ca9a25e304a4cbcb4c2e28ea5.jpg',
      isFotoReal: false,
      numerosOcupados: [3, 8, 15, 22, 30, 45], // Números já comprados
      codigosVenda: [
        { codigoVenda: 'VEN987', qtdNumeros: 3, usado: false } // Venda aberta para teste
      ],
      compras: []
    }
  ]);

  // Guarda qual rifa/venda está sendo acessada no momento
  const [rifaAtiva, setRifaAtiva] = useState(null);
  const [vendaAtiva, setVendaAtiva] = useState(null);
  const [modalSobreVisivel, setModalSobreVisivel] = useState(false);
  
  if (telaAtual === 'codigo') {
    return (
      <CodigoAcesso 
        onVoltar={() => setTelaAtual('home')} 
        rifas={rifas}
        setRifaAtiva={setRifaAtiva}
        setVendaAtiva={setVendaAtiva}
        onNavegar={(proximaTela) => setTelaAtual(proximaTela)} 
      />
    );
  }

  if (telaAtual === 'novaRifa') {
    return <CodigoCorreto 
        onVoltar={() => setTelaAtual('home')} 
        rifas={rifas}
        setRifas={setRifas}
      />;
  }
  if (telaAtual === 'telaCompra') {
    return <TelaCompra 
        onVoltar={() => setTelaAtual('home')} 
        rifaAtiva={rifaAtiva}
        vendaAtiva={vendaAtiva}
        rifas={rifas}
        setRifas={setRifas}
      />;
  }
  if (telaAtual === 'telaGerenciar') {
    return <TelaGerenciar 
        onVoltar={() => setTelaAtual('home')} 
        rifaAtiva={rifaAtiva}
        rifas={rifas}
        setRifas={setRifas}
        setRifaAtiva={setRifaAtiva}
      />;
  }
  
  return (
    <View style={styles.container}>
    
      <Image style={styles.logo} source={require('./Images/logoRifosa.png')}/>
      <Text> </Text>
      <Button color='#C44E04' title="Criar Rifa" onPress={() => setTelaAtual('novaRifa')}/>
      <Text> </Text>
      <Button color='#C44E04' title="Gerenciar Rifa" onPress={() => setTelaAtual('codigo')}/>
      <Text> </Text>
      <Button color='#C44E04' title="Comprar Rifa" onPress={() => setTelaAtual('codigo')}/>

      <TouchableOpacity activeOpacity={0.7} style={{marginTop: 'auto'}} onPress={() => setModalSobreVisivel(true)}>
        <Image style={styles.made} source={require('./Images/MadeBy.png')}/>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalSobreVisivel}
        onRequestClose={() => setModalSobreVisivel(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTextInfo}>
                Rifosa - V2.0
              </Text>   
              <Text style={styles.modalTextInfo}>
                Feito por Bruna Soares como requisito de nota para o IARTES.
              </Text>       
              <TouchableOpacity 
                style={styles.btnOkModal}
                onPress={() => {
                  setModalSobreVisivel(false);
                }}
              >
                <Text style={styles.btnOkModalText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
      </Modal>
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
    width: 150,
    height: 150,
    marginTop: 200,
  },
  made: {
    width: 80,
    height: 80,
    marginTop: 'auto',
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '80%',
    backgroundColor: '#706054',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C44E04',
  },
  btnOkModal: {
    backgroundColor: '#C44E04',
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 6,
  },
  btnOkModalText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalTextInfo: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
});




/*
const styles = StyleSheet.create({
  container:{
    backgroundcolor: 'pink',
    flex: 1,
    flexDirection: 'row',
    //flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textos:{
    fontsize: 25,
    borderwidth: 2,
  },
  imagens:{
    width: 80,
    height: 80,
    borderwidth: 1,
  },
  entrada: {
    height: 30,
    backgroundColor: 'pink',
    margin: 20,
    borderRadius: 8,
  }
})
*/