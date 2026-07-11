import java.util.*;
class OracleDecoder implements ExamSnapshot {
    private static final int PEOF=256,BPW=8; private HuffCode[] codes={new HuffCode(1,0,65),new HuffCode(2,2,66),new HuffCode(2,3,PEOF)};
    private static class HuffCode{int numBits,encodeVal,decodeVal;HuffCode(int n,int e,int d){numBits=n;encodeVal=e;decodeVal=d;}}
    static class BitInputStream{int[]bits;int i;BitInputStream(int...b){bits=b;}int readBits(int n){return i<bits.length?bits[i++]:-1;}}
    static class BitOutputStream{ArrayList<Integer>values=new ArrayList<>();void writeBits(int n,int v){values.add(v);}public String toString(){return values.toString();}}
public void decode(BitInputStream input, BitOutputStream output) {
    int numBits = 0;
    int encodedValue = 0;
    boolean reading = true;
    while (reading) {
        encodedValue = encodedValue * 2 + input.readBits(1);
        numBits++;
        for (HuffCode code : codes) {
            if (numBits == code.numBits && encodedValue == code.encodeVal) {
                numBits = 0;
                encodedValue = 0;
                if (code.decodeVal == PEOF) reading = false;
                else output.writeBits(BPW, code.decodeVal);
                break;
            }
        }
    }
}
    static OracleDecoder fixture(){return new OracleDecoder();}
    public Object examCall(int c){int[][]all={{0,1,0,1,1},{1,0,0,1,1},{0,0,1,1},{1,0,1,0,1,1},{1,1},{0,1,1}};BitOutputStream out=new BitOutputStream();decode(new BitInputStream(all[c]),out);return out.toString();}
    public String examSnapshot(){ArrayList<String>v=new ArrayList<>();for(HuffCode c:codes)v.add(c.numBits+":"+c.encodeVal+":"+c.decodeVal);return v.toString();}
}