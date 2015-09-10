sudo yum install nodejs gcc gcc-c++ mesa-libGL-devel mesa-libGLU-devel git freetype-devel readline-devel sqlite-devel wget p7zip npm -y
sudo yum update -y
wget http://mirrors.ustc.edu.cn/gnu/gcc/gcc-4.9.1/gcc-4.9.1.tar.bz2
tar vfx gcc-4.9.1.tar.bz2 
cd gcc-4.9.1
./contrib/download_prerequisites 
mkdir build
cd build
../configure --enable-checking=release --enable-languages=c,c++ --disable-multilib
make -j2
sudo make install

cd ../../
wget http://www.lua.org/ftp/lua-5.2.3.tar.gz
tar vfx lua-5.2.3.tar.gz
cd lua-5.2.3
make linux -j2
sudo make install

cd ..
wget 'http://downloads.sourceforge.net/project/irrlicht/Irrlicht%20SDK/1.8/1.8.1/irrlicht-1.8.1.zip?r=&ts=1405566830&use_mirror=superb-dca3' -O irrlicht-1.8.1.zip 
unzip irrlicht-1.8.1.zip 
cd irrlicht-1.8.1
cd source/Irrlicht
make sharedlib -j2
sudo make install

cd ../../../
wget 'http://downloads.sourceforge.net/project/premake/Premake/4.4/premake-4.4-beta5-src.zip?r=http%3A%2F%2Findustriousone.com%2Fpremake%2Fdownload&ts=1405567840&use_mirror=iweb' -O premake-4.4-beta5-src.zip
unzip premake-4.4-beta5-src.zip
cd premake-4.4-beta5/build/gmake.unix/
make -j2
cd ../../bin/release
sudo cp premake4 /usr/local/bin/

cd ../../../
curl 'https://cloud.github.com/downloads/libevent/libevent/libevent-2.0.21-stable.tar.gz' -o libevent-2.0.21-stable.tar.gz
tar vfx libevent-2.0.21-stable.tar.gz
cd libevent-2.0.21-stable
./configure
make -j2
sudo make install

cd ..
git clone https://github.com/mercury233/ygopro.git -b server ygopro-pre-release
cd ygopro/
premake4 gmake
cd build/
sed -i 's/-I\/usr\/include\/irrlicht/-I\/usr\/local\/include\/irrlicht/g' ygopro.make

make config=release ygopro -j2
cd ..
ln -s bin/release/ygopro ./
strip ygopro
cd ..

#ygopro lastest data
wget --user-agent="Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36" https://my-card.in/mycard/download -O mycard.7z
7za x mycard.7z mycard-$mycard_version/ygocore -y
yes | cp -rf mycard-$mycard_version/ygocore/* ygopro/
rm -rf mycard-$mycard_version mycard.7z

#ygopro-server
git clone https://github.com/mercury233/ygopro-server.git -b lite ygopro-server-pre
cd ygopro-server
npm install
sudo npm install -g coffee-script forever bunyan
ln -s ../ygopro-pre ygocore
