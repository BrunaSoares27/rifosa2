import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Modal 
} from 'react-native';
import GradeNumeros from './GradeNumeros';

export default function TelaCompra({ onVoltar, rifaAtiva, vendaAtiva, rifas, setRifas }) {
  const tituloPremio = rifaAtiva?.tituloPremio;
  const nomeProprietario = rifaAtiva?.nomeProprietario;
   // Máscara para Telefone
  const aplicarMascaraTelefone = (texto) => {
    // Remove tudo que não for dígito
    const apenasNumeros = texto.replace(/\D/g, '').slice(0, 11);

    // Aplica a máscara incrementalmente
    if (apenasNumeros.length === 0) return '';
    if (apenasNumeros.length <= 2) {
      return `(${apenasNumeros}`;
    }
    if (apenasNumeros.length <= 6) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    }
    if (apenasNumeros.length <= 10) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 6)}-${apenasNumeros.slice(6)}`;
    }
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7)}`;
  };

  console.log('A foto é real?', rifaAtiva.isFotoReal);
  
  const limitePermitido = vendaAtiva?.qtdNumeros || 1; // Pega a quantidade liberada no código
  
  const numInicial = rifaAtiva?.numeroInicial || 1;
  const numFinal = rifaAtiva?.numeroFinal || 60;
  
  // Gera a lista do intervalo real da rifa criada
  const numerosTotaisRifa = Array.from(
    { length: numFinal - numInicial + 1 }, 
    (_, i) => numInicial + i
  );
  
  const numerosOcupados = rifaAtiva?.numerosOcupados || [];

  // --- ESTADOS DO FORMULÁRIO ---
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [numerosSelecionados, setNumerosSelecionados] = useState([]);
  const [modalVisivel, setModalVisivel] = useState(false);

  // Lógica inteligente para selecionar / desmarcar números
  const toggleNumero = (numero) => {
    if (numerosSelecionados.includes(numero)) {
      // Se já tá selecionado, remove da lista
      setNumerosSelecionados(numerosSelecionados.filter(item => item !== numero));
    } else {
      // Se não atingiu o limite, adiciona
      if (numerosSelecionados.length < limitePermitido) {
        setNumerosSelecionados([...numerosSelecionados, numero]);
      } else {
        alert(`Você só comprou ${limitePermitido} número(s).`);
      }
    }
  };

  const handlePronto = () => {
    // 1. Limpa o telefone para contar apenas os dígitos numéricos
    const apenasNumerosTelefone = telefone.replace(/\D/g, '');

    // 2. Valida se preencheu nome e telefone
    if (!nome.trim() || !telefone.trim()) {
      alert('Por favor, preencha seu nome e telefone.');
      return;
    }

    // 3. Valida exatamente os 11 dígitos do telefone (DDD + 9 dígitos)
    if (apenasNumerosTelefone.length !== 11) {
      alert('Telefone inválido.');
      return;
    }

    if (numerosSelecionados.length !== limitePermitido) {
      alert(`Você precisa escolher ${limitePermitido} número(s).`);
      return;
    }

    setModalVisivel(true);
  };

  const handleConfirmarCompra = () => {
    // 1. Atualiza os dados no App.js
    if (setRifas && rifas && rifaAtiva && vendaAtiva) {
      const rifasAtualizadas = rifas.map(r => {
        if (r.codigoRifa === rifaAtiva.codigoRifa) {
          return {
            ...r,
            // Adiciona os novos números comprados à lista existente
            numerosOcupados: [...(r.numerosOcupados || []), ...numerosSelecionados],
            
            // Marca o código VEN... atual como usado (expirado)
            codigosVenda: r.codigosVenda.map(v => 
              v.codigoVenda === vendaAtiva.codigoVenda 
                ? { ...v, usado: true } 
                : v
            ),
            
            // Registra os detalhes da compra realizada
            compras: [
              ...(r.compras || []),
              {
                nome,
                telefone,
                numeros: numerosSelecionados,
                codigoVendaUsado: vendaAtiva.codigoVenda,
                dataCompra: new Date().toLocaleDateString('pt-BR')
              }
            ]
          };
        }
        return r;
      });

      setRifas(rifasAtualizadas);
    }

    // 2. Notifica o usuário e encerra o fluxo
    setModalVisivel(false);
    alert('Compra efetuada com sucesso!');
    onVoltar(); // Volta para a tela inicial
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#706054' }}>
      <View style={styles.container}>
        
        {/* BOTÃO VOLTAR (Canto Superior Esquerdo) */}
        <TouchableOpacity style={styles.btnTopLeft} onPress={onVoltar}>
          <Image 
            source={require('./Images/voltar.png')} 
            style={styles.iconTop} 
          />
        </TouchableOpacity>

        {/* BOTÃO HOME (Canto Superior Direito) */}
        <TouchableOpacity style={styles.btnTopRight} onPress={onVoltar}>
          <Image 
            source={require('./Images/home.png')} 
            style={styles.iconTop} 
          />
        </TouchableOpacity>

        <Image style={styles.logo} source={require('./Images/logoRifosa.png')}/>

        <Text style={styles.nomeProp}>Rifa de {nomeProprietario}</Text>
        <Text style={styles.restanteFrase}>{tituloPremio}</Text>

        <Image 
          source={
            rifaAtiva?.fotoPremio 
              ? { uri: rifaAtiva.fotoPremio } 
              : { uri: 'https://i.pinimg.com/736x/ba/ac/2a/baac2a0ca9a25e304a4cbcb4c2e28ea5.jpg' }
          } 
          style={styles.fotoPremio} 
        />

        {!rifaAtiva?.isFotoReal && (
          <Text style={{ color: '#FF9754', fontWeight: 'bold', marginTop: 5, textAlign: 'center' }}>
            *Imagem ilustrativa.
          </Text>
        )}

        {/* FORMULÁRIO DO COMPRADOR */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Insira seu nome completo:</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor="#AAA"
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>Insira seu telefone:</Text>
          <TextInput
            style={styles.input}
            placeholder="(68) 99999-8888"
            placeholderTextColor="#AAA"
            keyboardType="numeric"
            maxLength={15} // <--- Tamanho máximo (XX) XXXXX-XXXX
            value={telefone}
            onChangeText={(texto) => setTelefone(aplicarMascaraTelefone(texto))} // <--- Aplica a máscara
          />

          {/* FRASE DE INSTRUÇÃO E CONTADOR */}
          <Text style={styles.instrucaoText}>
            Escolha <Text style={styles.destaque}>{limitePermitido}</Text> número(s): 
            ({numerosSelecionados.length}/{limitePermitido})
          </Text>

          {/* GRADE DE NÚMEROS */}
          <GradeNumeros 
            numerosTotais={numerosTotaisRifa}
            numerosOcupados={numerosOcupados}
            numerosSelecionados={numerosSelecionados}
            onToggleNumero={toggleNumero}
          />

          {/* BOTÃO PRONTO */}
          <TouchableOpacity style={styles.btnPronto} onPress={handlePronto}>
            <Text style={styles.btnProntoText}>Pronto</Text>
          </TouchableOpacity>
        </View>

        {/* --- POPUP DE CONFIRMAÇÃO --- */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisivel}
          onRequestClose={() => setModalVisivel(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              
              {/* Botão X para fechar apenas o popup */}
              <TouchableOpacity 
                style={styles.btnCloseX} 
                onPress={() => setModalVisivel(false)}
              >
                <Text style={styles.txtX}>✕</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitulo}>Você escolheu:</Text>

              {/* CARD DOS NÚMEROS ESCOLHIDOS */}
              <View style={styles.numerosEscolhasRow}>
                {numerosSelecionados.map((num) => (
                  <View key={num} style={styles.cardNumeroFinal}>
                    <Text style={styles.txtNumeroFinal}>{num < 10 ? `0${num}` : num}</Text>
                  </View>
                ))}
              </View>

              {/* BOTÃO CONFIRMAR */}
              <TouchableOpacity 
                style={styles.btnConfirmar}
                onPress={handleConfirmarCompra}
              >
                <Text style={styles.btnConfirmarText}>Confirmar</Text>
              </TouchableOpacity>

              <Text style={styles.fraseSorte}>Boa sorte!</Text>

            </View>
          </View>
        </Modal>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#706054',
  },
  btnTopLeft: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 35,
    height: 35,
    zIndex: 10,
  },
  btnTopRight: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 35,
    height: 35,
    zIndex: 10,
  },
  iconTop: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    marginTop: 10,
  },
  logo: {
    width: 90,
    height: 90,
    marginTop: 15,
    resizeMode: 'contain',
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 15,
    paddingBottom: 40, // <-- Adicione isso para dar um respiro no final da rolagem
  },
  label: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
  },
  instrucaoText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  destaque: {
    color: '#FF9754',
    fontSize: 18,
  },
  btnPronto: {
    backgroundColor: '#C44E04',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  btnProntoText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // --- ESTILOS DO POPUP (MODAL) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#706054',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C44E04',
  },
  btnCloseX: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  txtX: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalTitulo: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
  },
  numerosEscolhasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  cardNumeroFinal: {
    backgroundColor: '#FFF',
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C44E04',
  },
  txtNumeroFinal: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  btnConfirmar: {
    backgroundColor: '#C44E04',
    paddingVertical: 10,
    paddingHorizontal: 35,
    borderRadius: 6,
  },
  btnConfirmarText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fraseSorte: {
    color: '#FF9754',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  fotoPremio: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#C44E04',
    resizeMode: 'cover',
  },
  restanteFrase:{
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Zapfino',
    //margin: 10,
  },
  nomeProp:{
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9754',
    fontFamily: 'Zapfino',
    marginTop: 10,
  },
});