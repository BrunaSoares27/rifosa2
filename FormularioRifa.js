import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Button,
  Modal
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';

export default function FormularioRifa({ onVoltar, rifas, setRifas }) {
  // Máscara para Data: DD/MM/AAAA
  const aplicarMascaraData = (texto) => {
    // Remove tudo que não for dígito
    const apenasNumeros = texto.replace(/\D/g, '').slice(0, 8);

    // Aplica a máscara incrementalmente
    if (apenasNumeros.length <= 2) {
      return apenasNumeros;
    }
    if (apenasNumeros.length <= 4) {
      return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`;
    }
    return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}/${apenasNumeros.slice(4)}`;
  };

  // --- VARIÁVEIS DE ESTADO (Para guardar os dados futuramente) ---
  const [nomeProprietario, setNomeProprietario] = useState('');
  const [tituloPremio, setTituloPremio] = useState('');
  const [valorRifa, setValorRifa] = useState('');
  const [dataSorteio, setDataSorteio] = useState('');
  const [fotoPremio, setFotoPremio] = useState(null); // Guardará a imagem/arquivo
  const [isFotoReal, setIsFotoReal] = useState(false); // Checkbox (true ou false)
  const [descricao, setDescricao] = useState('');

  const [numeroInicial, setNumeroInicial] = useState('');
  const [numeroFinal, setNumeroFinal] = useState('');

  // Função simulada para o botão de subir foto
  const handlePickImage = async () => {
  // Pede permissão e abre a galeria
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("É necessário permitir o acesso à galeria de fotos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setFotoPremio(result.assets[0].uri);
    }
  };

  const [codigoAcesso, setCodigoAcesso] = useState('XXXXXX'); // Código gerado
  const copiarCodigo = async () => {
    await Clipboard.setStringAsync(codigoAcesso);
    alert('Código copiado para a área de transferência!');
  };

  const [modalVisivel, setModalVisivel] = useState(false);

  const handleCriarRifa = () => {
    // 1. Validações de campos obrigatórios
    if (
      !nomeProprietario.trim() ||
      !tituloPremio.trim() ||
      !valorRifa.trim() ||
      !numeroInicial.trim() ||
      !numeroFinal.trim()
    ) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    // Validação da Data do Sorteio (não permitir datas que já passaram)
    if (dataSorteio.trim()) {
      const partes = dataSorteio.split('/');
      if (partes.length === 3) {
        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1; // Meses no JS começam em 0
        const ano = parseInt(partes[2], 10);

        const dataInserida = new Date(ano, mes, dia);
        const hoje = new Date();

        // Zera as horas para comparar apenas os dias
        hoje.setHours(0, 0, 0, 0);
        dataInserida.setHours(0, 0, 0, 0);

        if (dataInserida < hoje) {
          alert('A data do sorteio não pode ser anterior ao dia de hoje!');
          return;
        }
      } else {
        alert('Por favor, informe a data completa no formato DD/MM/AAAA!');
        return;
      }
    }

    if (!fotoPremio) {
      alert('Por favor, selecione uma foto para o prêmio!');
      return;
    }

    if (parseInt(numeroFinal) < parseInt(numeroInicial)) {
      alert('O último número deve ser maior que o primeiro número.');
      return;
    }

    // 2. Gera um código único no padrão RIF
    const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
    const novoCodigoRifa = `RIF${numeroAleatorio}`;

    // 3. Monta o objeto da nova Rifa
    const novaRifaObjeto = {
      codigoRifa: novoCodigoRifa,
      nomeProprietario: nomeProprietario.trim(),
      tituloPremio: tituloPremio.trim(),
      valorRifa: valorRifa.trim(),
      dataSorteio: dataSorteio.trim() || 'A definir',
      numeroInicial: parseInt(numeroInicial),
      numeroFinal: parseInt(numeroFinal),
      fotoPremio: fotoPremio,
      isFotoReal: isFotoReal,
      descricao: descricao.trim(),
      numerosOcupados: [], // Começa sem nenhum número vendido
      codigosVenda: [],    // Começa sem nenhum código de venda gerado
      compras: []
    };

    // 4. Salva no estado global do App.js
    if (setRifas && rifas) {
      setRifas([...rifas, novaRifaObjeto]);
    }

    // 5. Atualiza o código do modal e abre o popup
    setCodigoAcesso(novoCodigoRifa);
    setModalVisivel(true);
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.frase}>
        <Text style={styles.restanteFrase}>Crie sua rifa em instantes!</Text>
      </View>

      {/* 1. Nome do Proprietário */}
      <Text style={styles.label}>*Seu nome completo:</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#AAA"
        value={nomeProprietario}
        onChangeText={setNomeProprietario}
      />

      {/* 2. Título do Prêmio */}
      <Text style={styles.label}>*Prêmio:</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#AAA"
        value={tituloPremio}
        onChangeText={setTituloPremio}
      />

      {/* 3. Valor da Rifa e Data do Sorteio (Lado a lado) */}
      <View style={styles.row}>
        <View style={styles.halfInputContainer}>
          <Text style={styles.label}>*Valor (R$):</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor="#AAA"
            keyboardType="numeric"
            value={valorRifa}
            onChangeText={setValorRifa}
          />
        </View>

        <View style={styles.halfInputContainer}>
          <Text style={styles.label}>Data do sorteio:</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#AAA"
            keyboardType="numeric" // <--- Teclado numérico
            maxLength={10}        // <--- Limita ao tamanho DD/MM/AAAA
            value={dataSorteio}
            onChangeText={(texto) => setDataSorteio(aplicarMascaraData(texto))} // <--- Aplica a máscara
          />
        </View>
      </View>

      {/* 4. Foto do Prêmio (Upload) */}
      <Text style={styles.label}>*Foto do Prêmio:</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
        <Text style={styles.uploadButtonText}>
          {fotoPremio ? "Foto Selecionada ✓" : "📷 Selecionar Imagem"}
        </Text>
      </TouchableOpacity>

      {/* 5. Checkbox "Foto Real" */}
      <TouchableOpacity 
        style={styles.checkboxContainer} 
        onPress={() => setIsFotoReal(!isFotoReal)}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, isFotoReal && styles.checkboxChecked]}>
          {isFotoReal && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Esta foto é uma foto real do produto</Text>
      </TouchableOpacity>

      {/* Intervalo de Números da Rifa (Lado a lado) */}
      <View style={styles.row}>
        <View style={styles.halfInputContainer}>
          <Text style={styles.label}>*Primeiro número da rifa:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 1"
            placeholderTextColor="#AAA"
            keyboardType="numeric"
            value={numeroInicial}
            onChangeText={setNumeroInicial}
          />
        </View>

        <View style={styles.halfInputContainer}>
          <Text style={styles.label}>*Último número da rifa:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 100"
            placeholderTextColor="#AAA"
            keyboardType="numeric"
            value={numeroFinal}
            onChangeText={setNumeroFinal}
          />
        </View>
      </View>

      {/* 6. Descrição (Caixa grande) */}
      <Text style={styles.label}>Observações:</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descreva detalhes do prêmio, regras ou condições..."
        placeholderTextColor="#AAA"
        multiline={true}
        numberOfLines={4}
        textAlignVertical="top" // Faz o texto começar no topo da caixa no Android
        value={descricao}
        onChangeText={setDescricao}
      />


      {/* Botão de abrir a Janelinha Popup */}
      <View style={styles.btnCriar}>
        <Button 
          color="#C44E04" 
          title="Criar Rifa" 
          onPress={handleCriarRifa} 
        />
      </View>

      {/* --- ESTRUTURA DA JANELINHA POPUP (MODAL) --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Texto do Desenho */}
            <Text style={styles.modalText}>
              Sucesso com a sua rifa! Aqui está seu código de acesso:
            </Text>

            {/* Cardzinho Branco com o Código */}
            <TouchableOpacity 
              style={styles.codigoCard} 
              onPress={copiarCodigo}
              activeOpacity={0.7}
            >
              <Text style={styles.codigoText}>{codigoAcesso}</Text>
            </TouchableOpacity>

            {/* Botão OK */}
            <TouchableOpacity 
              style={styles.btnOk}
              onPress={() => {
                setModalVisivel(false);
                if (onVoltar) onVoltar();
              }}
            >
              <Text style={styles.btnOkText}>OK</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  btnCriar: {
    alignItems: 'center', // Centraliza o botão e impede que ele estique 100%
    marginTop: 20,       // Afasta da caixa de descrição
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    width: '48%',
  },
  uploadButton: {
    backgroundColor: '#E0E0E0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#C44E04',
  },
  uploadButtonText: {
    color: '#C44E04',
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#FFF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#C44E04',
    borderColor: '#C44E04',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    color: '#FFF',
    fontSize: 14,
  },
  textArea: {
    height: 100,
  },
  restanteFrase:{
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9754',
    fontFamily: 'Zapfino',
  },
  frase: {
    marginTop: 10,
    alignItems: 'center',
  },

  // --- ESTILOS DO POPUP (MODAL) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)', // Escurece o fundo atrás da janelinha
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#706054', // Mesmo tom da sua interface
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C44E04',
    elevation: 5,
  },
  modalText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  codigoCard: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#CCC',
    flexDirection: 'row',    // Coloca o texto e o ícone lado a lado
    alignItems: 'center',    // Centraliza verticalmente
    gap: 10,                // Espaçamento entre o código e o ícone
  },
  codigoText: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  btnOk: {
    backgroundColor: '#C44E04',
    paddingVertical: 8,
    paddingHorizontal: 35,
    borderRadius: 6,
  },
  btnOkText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});