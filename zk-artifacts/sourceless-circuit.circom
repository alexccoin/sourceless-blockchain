
pragma circom 2.0.0;

template SourcelessPrivacyProof() {
    signal input balance;
    signal input nullifier;
    signal input secret;
    signal output commitment;
    signal output proof;
    
    component hasher = Poseidon(3);
    hasher.inputs[0] <== balance;
    hasher.inputs[1] <== nullifier;
    hasher.inputs[2] <== secret;
    
    commitment <== hasher.out;
    proof <== hasher.out * hasher.out;
}

component main = SourcelessPrivacyProof();