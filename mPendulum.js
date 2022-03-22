var mCanvasWidth = 768
var mCanvasHeight = 768
var Ox = mCanvasWidth/2
var Oy = mCanvasHeight/2

var canvas_bg = document.createElement("canvas");
canvas_bg.width = mCanvasWidth;
canvas_bg.height = mCanvasHeight;
document.body.append(canvas_bg)
var ctx_bg = canvas_bg.getContext('2d');
ctx_bg.fillStyle = "rgb(0,0,0)";
ctx_bg.fillRect(0, 0, mCanvasWidth, mCanvasHeight);

  // Grid
  ctx_bg.strokeStyle = "rgb(255,255,255)";
  ctx_bg.beginPath();
  ctx_bg.moveTo(0, mCanvasHeight/2);
  ctx_bg.lineTo(mCanvasWidth, mCanvasHeight/2);
  ctx_bg.stroke();

  ctx_bg.beginPath();
  ctx_bg.moveTo(mCanvasWidth/2, 0);
  ctx_bg.lineTo(mCanvasWidth/2, mCanvasHeight);
  ctx_bg.stroke();

var canvas_moving = document.createElement("canvas");
canvas_moving.width = mCanvasWidth;
canvas_moving.height = mCanvasHeight;
document.body.append(canvas_moving)
var ctx_m = canvas_moving.getContext('2d');

var mVideoFPS = 60;
var mFrameCount = 0

var g = 9.8
var dT = 1.0E-5;//1.0E-5;
var M = 1.0

var N_pendulum_max = 32;//Max
var N_pendulum = 2; //N_pendulum_max;//Max
var mLinkLength = 1.0;
var vec_theta = Array(N_pendulum_max).fill(Math.PI*0.95)
var vec_thetaDot = Array(N_pendulum_max).fill(0.0)
var vec_L = Array(N_pendulum_max).fill(mLinkLength)
var vec_pos = Array(N_pendulum_max*2).fill(0.0)
var vec_pre_pos = Array(N_pendulum_max*2).fill(0.0)


for(var i=0;i<N_pendulum_max;i++){
  //vec_L[i] = mLinkLength;
}//

var L_ = 0
for(var i=0;i<N_pendulum;i++){
  L_ += vec_L[i]
}//

var mScale = mCanvasWidth / (L_*2*1.05)  
console.log("mScale:"+mScale)


setInterval(async () => {

  // Calculation each angle
  // for(var i=0;i<N_pendulum;i++){
  //   vec_theta[i] += 0.01 * (i+1)
  //   //console.log("vec_theta["+i+"]:"+vec_theta[i])
  // }//

  var N = N_pendulum;

  var A = new Array(N)
  var B = new Array(N)
  var Lmat = new Array(N)
  for (var i=0;i<N;i++){
    A[i] = new Array(N).fill(0.0)
    B[i] = new Array(N).fill(0.0)
    Lmat[i] = new Array(N).fill(0.0)
  }

  var b = new Array(N).fill(0.0)
  var D = new Array(N).fill(0.0)
  var x = new Array(N).fill(0.0)
  var y = new Array(N).fill(0.0)

  for (var t=0;t<1000;t++)
  {
      for (var i=0;i<N;i++){
          b[i]=0.0;
          D[i]=0.0;
          x[i]=0.0;
          y[i]=0.0;
          for (var j=0;j<N;j++) {
              A[i][j] = 0.0;
              B[i][j] = 0.0;
              Lmat[i][j] = 0.0;
          }//
          Lmat[i][i] = 1.0;
      }//

      //Log.i("MyApp","A,B");
      for (var i=0;i<N;i++){
          for (var j=0;j<N;j++) {
              for (var k=Math.max(i,j);k<N;k++) {
                  A[i][j] += M;
              }//
              B[i][j] = A[i][j];
              //A[i][j] *= L * Math.cos( vec_theta[i] - vec_theta[j] );
              A[i][j] *= vec_L[i]*vec_L[j]*Math.cos( vec_theta[i] - vec_theta[j] );

              if (i==j){
                  B[i][j] *= g*vec_L[i]*Math.sin( vec_theta[i] );
              }//
              else {
                  //B[i][j] *= L*vec_thetaDot[j]*vec_thetaDot[j]*Math.sin( vec_theta[i] - vec_theta[j] );
                  B[i][j] *= vec_L[i]*vec_L[j]*vec_thetaDot[j]*vec_thetaDot[j]*Math.sin( vec_theta[i] - vec_theta[j] );
              }//

          }//
      }//
      //Log.i("MyApp","A,B End");

      for (var i=0;i<N;i++) {
          for (var j = 0; j < N; j++) {
              b[i]+= -B[i][j];
          }//
      }//


      D[0] = A[0][0];

      //Log.i("MyApp","D,Lmat");
      for (var k=1;k<N;k++) {
          //Log.i("MyApp","k="+k);
          for (var i = 0; i <= k-1; i++) {
              //Log.i("MyApp","i="+i);
              Lmat[k][i] = A[k][i];

              for (var j = 0; j <= i-1; j++) {
                  //Log.i("MyApp","j="+j);
                  Lmat[k][i] -= Lmat[k][j]*Lmat[i][j]*D[j];
              }//
              Lmat[k][i] /= D[i];
          }//

          D[k] = A[k][k];
          for (var i = 0; i <= k-1; i++) {
              D[k] -= Lmat[k][i]*Lmat[k][i]*D[i];
          }//

      }//
      //Log.i("MyApp","D,Lmat End");

      y[0] = b[0];
      for (var k=1;k<N;k++) {
          y[k] = b[k];
          for (var i = 0; i <= k-1; i++) {
              y[k] -= Lmat[k][i] * y[i];
          }//
      }//

      for (var k=0;k<N;k++) {
          y[k] /= D[k];
      }

      x[N-1] = y[N-1];
      for (var k=N-2;k>=0;k--) {
          x[k] = y[k];
          for (var i = k+1; i < N; i++) {
              x[k] -= Lmat[i][k]*x[i];
          }//
      }//

      for (var k=0;k<N;k++) {
          vec_thetaDot[k] += x[k]*dT;
          vec_theta[k] += vec_thetaDot[k]*dT;
      }

      //mStep += 1;

  }//for


  // Energy monitoring
  var K = new Array(N).fill(0.0)
  var U = new Array(N).fill(0.0)

  for (var i=0;i<N;i++){
      K[i] = 0.0;
      U[i] = 0.0;
      for (var j=0;j<=i;j++){
          for (var k=j;k<=i;k++){
              if (j==k){
                  K[i] += 0.5*vec_L[j]*vec_L[k]*vec_thetaDot[j]*vec_thetaDot[k]*Math.cos( vec_theta[j]-vec_theta[k]);
              }
              else{
                  K[i] += vec_L[j]*vec_L[k]*vec_thetaDot[j]*vec_thetaDot[k]*Math.cos( vec_theta[j]-vec_theta[k]);
              }
          }//k
          U[i] += vec_L[j] * Math.cos( vec_theta[j] );
      }//j
      K[i] *= M;
      U[i] *= M*g;
  }//i

  var E = 0.0;
  for (var i=0;i<N;i++){
      E += K[i] - U[i];
  }//

  

  // Update each position
  var offset_angle = - Math.PI /2 
  vec_pos[0] = vec_L[0] * Math.cos( vec_theta[0] + offset_angle )
  vec_pos[1] = vec_L[0] * Math.sin( vec_theta[0] + offset_angle)
  //console.log("vec_pos[0]:"+[vec_pos[0], vec_pos[1]])
  for(var i=1;i<N_pendulum;i++){
    vec_pos[i*2+0] = vec_pos[(i-1)*2+0] + vec_L[i] * Math.cos( vec_theta[i] + offset_angle )
    vec_pos[i*2+1] = vec_pos[(i-1)*2+1] + vec_L[i] * Math.sin( vec_theta[i] + offset_angle )
    //console.log("vec_pos["+i+"]:"+[vec_pos[i*2+0], vec_pos[i*2+1]])
  }//

  if(mFrameCount==0){
    for(var i=0;i<N_pendulum;i++){
      vec_pre_pos[i*2+0] = vec_pos[i*2+0]
      vec_pre_pos[i*2+1] = vec_pos[i*2+1]
    }
  }

  // Path
  //ctx_bg.strokeStyle = "rgb(255,0,0)";
  

  for(var i=0;i<N_pendulum;i++){
    ctx_bg.strokeStyle = "#18EBF9";
    if( vec_pre_pos[i*2+1] <= 0 ){
      ctx_bg.strokeStyle = "#fff100";
    }
  
    ctx_bg.beginPath();
    ctx_bg.moveTo(Ox+vec_pre_pos[i*2+0]*mScale, Oy-vec_pre_pos[i*2+1]*mScale);
    ctx_bg.lineTo(Ox+vec_pos[i*2+0]*mScale, Oy-vec_pos[i*2+1]*mScale);
    ctx_bg.stroke();

    vec_pre_pos[i*2+0] = vec_pos[i*2+0]
    vec_pre_pos[i*2+1] = vec_pos[i*2+1]
  }




  ctx_m.clearRect(0, 0, mCanvasWidth, mCanvasHeight)

  // Link
  //ctx_m.strokeStyle = "#18EBF9"; //"rgb(255,255,60)";
  ctx_m.strokeStyle = "rgb(50,50,255)" //"blue"
  ctx_m.beginPath();
  ctx_m.moveTo(Ox, Oy);
  ctx_m.lineTo(Ox+vec_pos[0]*mScale, Oy-vec_pos[1]*mScale);
  ctx_m.stroke();
  for(var i=1;i<N_pendulum;i++){    
    //ctx_m.strokeStyle = "#fff100" //"rgb(255,255,60)";
    ctx_m.strokeStyle = "yellow"
    ctx_m.beginPath();
    ctx_m.moveTo(Ox+vec_pos[(i-1)*2+0]*mScale, Oy-vec_pos[(i-1)*2+1]*mScale);
    ctx_m.lineTo(Ox+vec_pos[i*2+0]*mScale, Oy-vec_pos[i*2+1]*mScale);
    ctx_m.stroke();
  }
  
  // Mass
  for(var i=0;i<N_pendulum;i++){
    ctx_m.fillStyle = "rgb(50,50,255)" ;
    if(i==1){
      ctx_m.fillStyle = "yellow"
    }
    ctx_m.beginPath () ;
    ctx_m.arc( Ox+vec_pos[i*2+0]*mScale, Oy-vec_pos[i*2+1]*mScale, 10, 0, Math.PI*2, false ) ;
    ctx_m.fill() ;
  }

  // Energy
  ctx_m.font = "15px serif";
  ctx_m.fillStyle = 'rgb(255,0,0)'
  ctx_m.fillText(" E:"+ E.toExponential(3), 10, 20);  


  mFrameCount += 1

}, 1000/mVideoFPS)

